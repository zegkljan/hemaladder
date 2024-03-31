from distutils.command.config import LANG_EXT
import enum
import json
import pathlib
from dataclasses import dataclass
from math import prod
from re import U
import sys
import os
import shutil
from typing import Any, List, Mapping, Optional, Sequence, Tuple, Union
from checking import find_person, find_club
import json_logic as jl


class Category(enum.Enum):
    MEN_OPEN = 'mo'
    WOMEN = 'w'


class Division(enum.Enum):
    LS = 'ls'    # long sword
    SAB = 'sab'  # sword & buckler
    R = 'r'      # rapier
    RAD = 'rad'  # rapier & dagger
    SB = 'sb'    # saber
    M = 'm'      # messer
    SS = 'ss'    # sidesword
    SM = 'sm'    # smallsword
    B = 'b'      # bayonet


class CoefficientType(enum.Enum):
    FOREIGN = 'foreign'
    FOREIGN_25_50 = 'foreign_25_50'
    FOREIGN_50_75 = 'foreign_50_75'
    FOREIGN_75_100 = 'foreign_75_100'
    CHAMPIONSHIP = 'championship'
    RANK_1 = 'rank_1'
    RANK_2 = 'rank_2'
    RANK_3 = 'rank_3'
    RANK_4 = 'rank_4'


@dataclass
class TournamentResultEntry:
    fencer_id: str
    rank: int

    def as_dict(self) -> dict:
        return {
            'fencer_id': self.fencer_id,
            'rank': self.rank
        }


@dataclass
class Competition:
    subtitle: Optional[str]
    division: Division
    category: Category
    no_participants: int
    results: List[TournamentResultEntry]
    results_link: Optional[str]

    def as_dict(self) -> dict:
        res = {
            'division': self.division,
            'category': self.category,
            'no_participants': self.no_participants,
            'results': [e.as_dict() for e in self.results],
            'results_link': self.results_link
        }
        if self.subtitle is not None:
            res['subtitle'] = self.subtitle
        return res


class Tournament:
    def __init__(self, id: str, raw: dict) -> None:
        self.tournament_id = id
        self.name: str = raw['name']
        self.date: str = raw['date']
        self.country: str = raw['country']
        self.championship: bool = raw.get('championship', False)

        self.competitions: List[Competition] = [
            Competition(
                subtitle=c.get('subtitle', None),
                division=Division(c['division']),
                category=Category(c['category']),
                no_participants=c['no_participants'],
                results=[TournamentResultEntry(entry['fencer_id'], int(entry['rank'])) for entry in c['results']],
                results_link=c.get('results_link', None)
            ) for c in raw['competitions']
        ]

    def as_dict(self) -> dict:
        return {
            'tournament_id': self.tournament_id,
            'name': self.name,
            'date': self.date,
            'country': self.country,
            'championship': self.championship,
            'competitions': [competition.as_dict() for competition in self.competitions]
        }


@dataclass
class Person:
    id: str
    name: str
    surname: str
    nationality: Union[str, None]

    def __init__(self, id: str, raw: dict) -> None:
        self.id = id
        self.name = raw['name']
        self.surname = raw['surname']
        if 'nationality' not in raw:
            self.nationality = None
        else:
            self.nationality = raw['nationality']


@dataclass
class Club:
    id: str
    name: str
    country: Union[str, None]

    def __init__(self, id: str, raw: dict) -> None:
        self.id = id
        self.name = raw['name']
        if 'country' not in raw:
            self.country = None
        else:
            self.country = raw['country']


@dataclass
class Coefficient:
    c: float
    c_type: CoefficientType

    def to_dict(self) -> dict:
        return {
            "c": self.c,
            "type": self.c_type.value
        }


@dataclass
class TournamentLadderEntry:
    tournament_id: str
    competition_idx: int
    coefficients: List[Coefficient]
    base_points: float
    rank: int
    championship: bool

    def points(self) -> int:
        return round(self.base_points * prod(map(lambda x: x.c, self.coefficients)))

    def to_dict(self) -> dict:
        return {
            "tournament_id": self.tournament_id,
            "competition_idx": self.competition_idx,
            "base_points": self.base_points,
            "rank": self.rank,
            "points": self.points(),
            "coefficients": [
                coeff.to_dict() for coeff in self.coefficients
            ]
        }


@dataclass
class LadderIndividualEntry:
    fencer_id: str
    rank: int
    last_season_rank: Optional[int]
    counted_tournaments: List[TournamentLadderEntry]
    uncounted_tournaments: List[TournamentLadderEntry]

    def points(self) -> int:
        return sum(map(lambda x: x.points(), self.counted_tournaments))

    def to_dict(self) -> dict:
        res = {
            "fencer_id": self.fencer_id,
            "rank": self.rank,
            "points": self.points(),
            "counted_tournaments": [
                tournament.to_dict() for tournament in self.counted_tournaments
            ],
            "uncounted_tournaments": [
                tournament.to_dict() for tournament in self.uncounted_tournaments
            ]
        }
        if self.last_season_rank is not None:
            res["last_season_rank"] = self.last_season_rank
        return res


@dataclass
class LadderClubEntry:
    club_id: Optional[str]
    fencers: Mapping[str, int]

    def points(self) -> int:
        return sum(self.fencers.values())

    def to_dict(self) -> dict:
        res = {
            "points": self.points(),
            "fencers": [
                {
                    "fencer_id": fencer_id,
                    "points": points
                } for fencer_id, points in self.fencers.items()
            ]
        }
        if self.club_id is not None:
            res['club_id'] = self.club_id
        return res


LadderIndividual = List[LadderIndividualEntry]
LaddersIndividual = Mapping[Division, Mapping[Category, LadderIndividual]]
LaddersClub = Mapping[Division,
                      Mapping[Category, List[LadderClubEntry]]]

class Scorer:
    def __init__(self, d: dict) -> None:
        self.rules: List[dict] = d['coefficients']

    def score(self, t: Tournament, c: Competition, r: int) -> Tuple[List[Coefficient], int]:
        """Returns list of coefficients applied to this tournament and rank, and base number of points for this rank."""
        coeffs = []
        for rule in self.rules:
            result = jl.jsonLogic(rule, {
                'tournament': t.as_dict(),
                'competition': c.as_dict(),
                'rank': r
            })
            if result is None:
                continue
            coeffs.append(Coefficient(result['value'], CoefficientType(result['type'])))

        points = c.no_participants - r + 1

        return coeffs, points


class Combiner:
    def combine(self, ts: Sequence[TournamentLadderEntry]) -> Tuple[Sequence[TournamentLadderEntry], Sequence[TournamentLadderEntry]]:
        raise NotImplementedError()


class AllCombiner(Combiner):
    def combine(self, ts: Sequence[TournamentLadderEntry]) -> Tuple[Sequence[TournamentLadderEntry], Sequence[TournamentLadderEntry]]:
        return ts, []


class BestNCombiner(Combiner):
    def __init__(self, n: int) -> None:
        self.n = n

    def combine(self, ts: Sequence[TournamentLadderEntry]) -> Tuple[Sequence[TournamentLadderEntry], Sequence[TournamentLadderEntry]]:
        champ = next(filter(lambda e: e.championship, ts), None)
        if champ is None:
            champ = []
        else:
            champ = [champ]
        nonchamp = list(filter(lambda e: not e.championship, ts))
        nonchamp.sort(key=lambda e: e.points(), reverse=True)
        return champ + nonchamp[:self.n], nonchamp[self.n:]


class Combiners:
    def __init__(self, d: dict) -> None:
        self.combiners: Mapping[Tuple[Optional[Division], Optional[Category]], Combiner] = {}
        if '*' in d:
            self.combiners[None, None] = self.get_combiner(d['*'])
        for division in Division:
            if '*' in d.get(division.value, {}):
                self.combiners[division, None] = self.get_combiner(d[division.value]['*'])
            for category in Category:
                if division.value in d and category.value in d[division.value]:
                    self.combiners[division, category] = self.get_combiner(d[division.value][category.value])

    def get(self, d: Division, c: Category) -> Combiner:
        res = self.combiners.get((d, c), None)
        if res is not None:
            return res
        res = self.combiners.get((d, None), None)
        if res is not None:
            return res
        return self.combiners[None, None]

    @staticmethod
    def get_combiner(d: dict) -> Combiner:
        t = d['type']
        if t == 'all':
            return AllCombiner()
        if t == 'best-n+champ':
            n = int(d['n'])
            return BestNCombiner(n)
        raise ValueError(f'Invalid combiner type {t}.')


@dataclass
class Stats:
    national_fencer_count: Mapping[Division,
                                   Mapping[Category, Mapping[str, int]]]

    def to_dict(self):
        return {
            "national_fencer_count": {
                d.value: {
                    c.value: cv for c, cv in dv.items()
                } for d, dv in self.national_fencer_count.items()
            }
        }


class Builder:
    def __init__(self,
                 tournaments: Mapping[str, Tournament],
                 people: Mapping[str, Person],
                 clubs: Mapping[str, Club],
                 people_clubs: Mapping[str, str],
                 scorer: Scorer,
                 combiners: Combiners) -> None:
        self.tournaments = tournaments
        self.people = people
        self.clubs = clubs
        self.people_clubs = people_clubs
        self.scorer = scorer
        self.combiners = combiners

        self._intermediate_individual: dict[Division,
                                            dict[Category,
                                                 dict[str,
                                                      List[TournamentLadderEntry]]]] = {}
        self._stats = Stats(dict())

    def check_duplicities(self) -> bool:
        res = True

        people_rev_map: Mapping[Tuple[str, str], List[Person]] = dict()
        for p in self.people.values():
            k = (p.name, p.surname)
            if k not in people_rev_map:
                people_rev_map[k] = [p]
            else:
                people_rev_map[k].append(p)
        dup_people = [ps for ps in people_rev_map.values() if len(ps) > 1]
        if len(dup_people) > 0:
            res = False
        for dup in dup_people:
            details = [f'{{id: {p.id}, club: {p.club_id}, nationality: {p.nationality}}}' for p in dup]
            print(f'Duplicate person {dup[0].name} {dup[0].surname}: {", ".join(details)}')

        club_rev_map: Mapping[str, List[Club]] = dict()
        for c in self.clubs.values():
            if c.name not in club_rev_map:
                club_rev_map[c.name] = [c]
            else:
                club_rev_map[c.name].append(c)
        dup_clubs = [cs for cs in club_rev_map.values() if len(cs) > 1]
        if len(dup_clubs) > 0:
            res = False
        for dup in dup_clubs:
            details = [f'{{id: {c.id}, country: {c.country}}}' for c in dup]
            print(f'Duplicate club {dup[0].name}: {", ".join(details)}')

        return res


    def build(self, previous_season: LaddersIndividual) -> Tuple[LaddersIndividual, LaddersClub, Stats]:
        self._intermediate_individual = {}
        for tournament in self.tournaments.values():
            for idx, competition in enumerate(tournament.competitions):
                if competition.division not in self._intermediate_individual:
                    self._intermediate_individual[competition.division] = {}
                if competition.category not in self._intermediate_individual[competition.division]:
                    self._intermediate_individual[competition.division][competition.category] = {}
                self.process_competition(tournament, competition, idx)

        ladder_individual = {
            division: {
                category: self.make_ladder(
                    combiner=self.combiners.get(division, category),
                    input=self._intermediate_individual[division][category],
                    prev_season=previous_season.get(division, dict()).get(category, list()))
                for category in self._intermediate_individual[division]
            } for division in self._intermediate_individual
        }

        ladder_club: Mapping[Division,
                             Mapping[Category, List[LadderClubEntry]]] = {}
        for division in ladder_individual:
            if division not in ladder_club:
                ladder_club[division] = {}
            ld = ladder_club[division]
            for category in ladder_individual[division]:
                if category not in ld:
                    ld[category] = []
                lc = ld[category]
                for entry in ladder_individual[division][category]:
                    if entry.fencer_id not in self.people:
                        print(f'Unknown fencer {entry.fencer_id}!')
                    club_id = self.people_clubs.get(entry.fencer_id, None)
                    lcl = next(
                        filter(lambda x: x.club_id == club_id, lc), None)
                    if lcl is None:
                        lcl = LadderClubEntry(club_id, {})
                        lc.append(lcl)
                    lcl.fencers[entry.fencer_id] = entry.points()

        return ladder_individual, ladder_club, self._stats

    def process_competition(self, tournament: Tournament, competition: Competition, competition_idx: int):
        _intermediate_individual = self._intermediate_individual[competition.division][competition.category]

        if competition.division not in self._stats.national_fencer_count:
            self._stats.national_fencer_count[competition.division] = dict()
        if competition.category not in self._stats.national_fencer_count[competition.division]:
            self._stats.national_fencer_count[competition.division][competition.category] = dict()
        self._stats.national_fencer_count[competition.division][competition.category][tournament.tournament_id] = 0

        for entry in competition.results:
            try:
                person = self.people[entry.fencer_id]
            except KeyError:
                print("Tournament {}, subtitle {}, division {}, category {} - missing person {}.".format(
                    tournament.tournament_id, competition.subtitle, competition.division.value, competition.category.value, entry.fencer_id))
                person, person_club, club = find_person(entry.fencer_id)
                print("Attempted to find person at HR:\n\"{}\": {}\n{}\n{}".format(
                    entry.fencer_id,
                    json.dumps(person, indent=2, ensure_ascii=False),
                    "\"{}\": \"{}\"".format(person_club[0], person_club[1]) if person_club is not None else "no club mapping",
                    json.dumps(club, indent=2, ensure_ascii=False)
                ))
                sys.exit(1)
            if self.people_clubs.get(person.id, None) is not None:
                try:
                    club = self.clubs[self.people_clubs[person.id]]
                except KeyError:
                    print("Person {} - missing club {}.".format(
                        person.id, self.people_clubs[person.id]))
                    club = find_club(self.people_clubs[person.id])
                    print("Attempted to find club at HR: \"{}\": {}".format(
                        self.people_clubs[person.id], json.dumps(club, indent=2, ensure_ascii=False)))
                    sys.exit(1)

            self._stats.national_fencer_count[competition.division][competition.category][tournament.tournament_id] += 1

            if entry.fencer_id not in _intermediate_individual:
                _intermediate_individual[entry.fencer_id] = []

            coeffs, base_points = self.scorer.score(tournament, competition, entry.rank)
            ladder_entry = TournamentLadderEntry(tournament_id=tournament.tournament_id,
                                                 competition_idx=competition_idx,
                                                 coefficients=coeffs,
                                                 base_points=base_points,
                                                 rank=entry.rank,
                                                 championship=tournament.championship)

            _intermediate_individual[entry.fencer_id].append(ladder_entry)

    def make_ladder(self, combiner: Combiner, input: Mapping[str, List[TournamentLadderEntry]], prev_season: LadderIndividual) -> Sequence[LadderIndividualEntry]:
        entries: List[LadderIndividualEntry] = []
        for k, v in input.items():
            counted, uncounted = combiner.combine(v)
            entry = LadderIndividualEntry(
                fencer_id=k,
                counted_tournaments=sorted(counted, key=lambda t: self.tournaments[t.tournament_id].date),
                uncounted_tournaments=sorted(uncounted, key=lambda t: self.tournaments[t.tournament_id].date),
                last_season_rank=0,
                rank=0
            )
            entries.append(entry)


        def key(e: LadderIndividualEntry) -> Tuple[int, float]:
            return (
                -e.points(),
                sum(map(lambda t: t.rank, e.counted_tournaments)) / len(e.counted_tournaments)
            )
        srt = sorted([(key(e), e) for e in entries], key=lambda x: x[0])
        final = [LadderIndividualEntry(fencer_id=srt[0][1].fencer_id,
                                       rank=1,
                                       counted_tournaments=srt[0][1].counted_tournaments,
                                       uncounted_tournaments=srt[0][1].uncounted_tournaments,
                                       last_season_rank=self.find_previous_rank(srt[0][1].fencer_id, prev_season))]
        for i in range(1, len(srt)):
            k, e = srt[i]
            k_prev, _ = srt[i - 1]
            if k_prev == k:
                r = final[-1].rank
            else:
                r = len(final) + 1
            final.append(LadderIndividualEntry(
                fencer_id=e.fencer_id,
                rank=r,
                counted_tournaments=e.counted_tournaments,
                uncounted_tournaments=e.uncounted_tournaments,
                last_season_rank=self.find_previous_rank(e.fencer_id, prev_season)))

        return final

    @staticmethod
    def find_previous_rank(fencer_id: str, previous_ladder: LadderIndividual) -> Optional[int]:
        for e in previous_ladder:
            if e.fencer_id == fencer_id:
                return e.rank
        return None


def main():
    dst_data_dir = src_data_dir = pathlib.Path(sys.argv[1])
    if len(sys.argv) > 1:
        dst_data_dir = pathlib.Path(sys.argv[2])

    # source data is always part of the destination data => clear the destination and copy source to destination, if it is a different directory
    if dst_data_dir != src_data_dir:
        if dst_data_dir.exists():
            shutil.rmtree(dst_data_dir)
        shutil.copytree(src_data_dir, dst_data_dir, ignore=shutil.ignore_patterns('.git'))

    people: Mapping[str, Person] = {
        x[0]: Person(x[0], x[1]) for x in read_json(src_data_dir.joinpath('people.json')).items()
    }
    clubs: Mapping[str, Club] = {
        x[0]: Club(x[0], x[1]) for x in read_json(src_data_dir.joinpath('clubs.json')).items()
    }

    seasons = read_json(src_data_dir.joinpath('seasons.json'))

    ladders_individual = dict()
    for season in sorted(seasons, key=lambda s: s["name"]):
        people_clubs: Mapping[str, str] = read_json(src_data_dir.joinpath('seasons', season['folder'], 'people-clubs.json'))
        tournaments: Mapping[str, Tournament] = {
            tid: Tournament(tid, data)
            for tid, data
            in read_json(src_data_dir.joinpath('seasons', season['folder'], 'tournaments.json')).items()
        }
        scorer = Scorer(season['scorer'])
        combiners = Combiners(season['combiner'])
        builder = Builder(tournaments, people, clubs, people_clubs, scorer, combiners)
        if not builder.check_duplicities():
            return
        ladders_individual, ladders_club, stats = builder.build(
            ladders_individual)
        write_json(dst_data_dir.joinpath('seasons', season['folder'], 'ladders-individual.json'),
                   ladders_individual_to_dict(ladders_individual))
        write_json(dst_data_dir.joinpath('seasons', season['folder'], 'ladders-club.json'),
                   ladders_club_to_dict(ladders_club))
        write_json(dst_data_dir.joinpath(
            'seasons', season['folder'], 'stats.json'), stats.to_dict())

        people_wo_club = dict()
        for ls in ladders_individual.values():
            for l in ls.values():
                for e in l:
                    if e.fencer_id not in people_clubs:
                        found_club_mapping = e.fencer_id
                        if int(e.fencer_id) >= 0:
                            _, f, c = find_person(e.fencer_id)
                            found_club_mapping = f'{c["name"]} -- "{f[0]}": "{f[1]}"'
                        people_wo_club[e.fencer_id] = found_club_mapping

        print(f'Check for club assignment of these people (have no club in season {season["name"]}):')
        print('\n'.join([f'{people[k].name} {people[k].surname} -- {v}' for k, v in people_wo_club.items()]))
        print()
    print('DONE')

    print()
    print('Check for existence of these people on HR (have no HR ID yet):')
    print('\n'.join([f'{v.name} {v.surname} {k}' for k, v in people.items() if int(k) < 0]))
    print()
    print('Check for existence of these clubs on HR (have no HR ID yet):')
    print('\n'.join([f'{v.name} {k}' for k, v in clubs.items() if int(k) < 0]))


def ladders_individual_to_dict(ladders: LaddersIndividual) -> dict:
    return {
        division.value: {
            category.value: [
                entry.to_dict() for entry in c
            ] for category, c in d.items()
        } for division, d in ladders.items()
    }


def ladders_club_to_dict(ladders: LaddersClub) -> dict:
    return {
        division.value: {
            category.value: [
                entry.to_dict()
                for entry in c
            ] for category, c in d.items()
        } for division, d in ladders.items()
    }


def read_json(path: pathlib.Path) -> dict:
    with open(path, 'r') as f:
        return json.load(f)


def write_json(path: pathlib.Path, obj: Any):
    os.makedirs(path.parent, exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, indent=2)


if __name__ == '__main__':
    main()
