import enum
import json
import pathlib
from dataclasses import dataclass
from math import prod
import sys
from typing import Any, List, Mapping, Optional, Sequence, Tuple, Union
from checking import find_person, find_club


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


class CoefficientType(enum.Enum):
    TOURNAMENT = 'tournament'
    FOREIGN = 'foreign'
    HIGHER_CATEGORY = 'higher_category'
    RANK_1 = 'rank_1'
    RANK_2 = 'rank_2'
    RANK_3 = 'rank_3'
    RANK_4 = 'rank_4'


@dataclass
class TournamentResultEntry:
    fencer_id: str
    rank: int


@dataclass
class Competition:
    no_participants: int
    results: List[TournamentResultEntry]


class Tournament:
    def __init__(self, id: str, raw: dict) -> None:
        self.tournament_id = id
        self.name: str = raw['name']
        self.date: str = raw['date']
        self.country: str = raw['country']
        self.coefficient: float = raw['coefficient']

        self.competitions: Mapping[Division, Mapping[Category, Competition]] = {
            Division(k1): {
                Category(k2): Competition(v2['no_participants'], [
                    TournamentResultEntry(entry['fencer_id'], int(entry['rank'])) for entry in v2['results']
                ]) for k2, v2 in v1.items()
            } for k1, v1 in raw['competitions'].items()
        }


@dataclass
class Person:
    id: str
    name: str
    surname: str
    club_id: Union[str, None]
    nationality: Union[str, None]
    category: Union[Category, None]

    def __init__(self, id: str, raw: dict) -> None:
        self.id = id
        self.name = raw['name']
        self.surname = raw['surname']
        self.club_id = raw.get('club_id', None)
        if 'nationality' not in raw:
            self.nationality = None
        else:
            self.nationality = raw['nationality']

        if 'category' not in raw:
            self.category = None
        else:
            self.category = Category(raw['category'])


@dataclass
class Club:
    id: str
    name: str
    country: str

    def __init__(self, id: str, raw: dict) -> None:
        self.id = id
        self.name = raw['name']
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
    coefficients: List[Coefficient]
    base_points: float
    rank: int

    def points(self) -> int:
        return round(self.base_points * prod(map(lambda x: x.c, self.coefficients)))

    def to_dict(self) -> dict:
        return {
            "tournament_id": self.tournament_id,
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
    tournaments: List[TournamentLadderEntry]

    def points(self) -> int:
        return sum(map(lambda x: x.points(), self.tournaments))

    def to_dict(self) -> dict:
        res = {
            "fencer_id": self.fencer_id,
            "rank": self.rank,
            "points": self.points(),
            "tournaments": [
                tournament.to_dict() for tournament in self.tournaments
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


@dataclass
class LadderSettings:
    foreign_tournament_coefficient: float
    higher_category_coefficient: float
    rank_coefficients: Tuple[float, float, float, float]

    @staticmethod
    def from_dict(d: dict) -> 'LadderSettings':
        return LadderSettings(
            foreign_tournament_coefficient=float(
                d['foreign_tournament_coefficient']),
            higher_category_coefficient=float(
                d['higher_category_coefficient']),
            rank_coefficients=(
                float(d['rank_coefficients'][0]),
                float(d['rank_coefficients'][1]),
                float(d['rank_coefficients'][2]),
                float(d['rank_coefficients'][3])))


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
    def __init__(self, tournaments: dict, people: dict, clubs: dict, settings: LadderSettings) -> None:
        self.tournaments: List[Tournament] = list(
            map(lambda x: Tournament(x[0], x[1]), tournaments.items()))
        self.people: Mapping[str, Person] = {
            x[0]: Person(x[0], x[1]) for x in people.items()
        }
        self.clubs: Mapping[str, Club] = {
            x[0]: Club(x[0], x[1]) for x in clubs.items()
        }

        self.settings = settings

        self._intermediate_individual: dict[Division,
                                            dict[Category, dict[str, LadderIndividualEntry]]] = {}
        self._stats = Stats(dict())

    def build(self, previous_season: LaddersIndividual) -> Tuple[LaddersIndividual, LaddersClub, Stats]:
        self._intermediate_individual = {}
        for tournament in self.tournaments:
            for division in tournament.competitions:
                if division not in self._intermediate_individual:
                    self._intermediate_individual[division] = {}
                for category in tournament.competitions[division]:
                    if category not in self._intermediate_individual[division]:
                        self._intermediate_individual[division][category] = {}
                    self.process_competition(tournament, division, category)

        ladder_individual = {
            division: {
                category: [LadderIndividualEntry(
                    fencer_id=e.fencer_id,
                    rank=e.rank,
                    last_season_rank=self.find_previous_rank(
                        e.fencer_id, previous_season.get(division, dict()).get(category, list())),
                    tournaments=e.tournaments
                ) for e in self.sorted_entries(
                    self._intermediate_individual[division][category].values())]
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
                    club_id = self.people[entry.fencer_id].club_id
                    lcl = next(
                        filter(lambda x: x.club_id == club_id, lc), None)
                    if lcl is None:
                        lcl = LadderClubEntry(club_id, {})
                        lc.append(lcl)
                    lcl.fencers[entry.fencer_id] = entry.points()

        return ladder_individual, ladder_club, self._stats

    def process_competition(self, tournament: Tournament, division: Division, category: Category):
        competition = tournament.competitions[division][category]
        _intermediate_individual = self._intermediate_individual[division][category]

        if division not in self._stats.national_fencer_count:
            self._stats.national_fencer_count[division] = dict()
        if category not in self._stats.national_fencer_count[division]:
            self._stats.national_fencer_count[division][category] = dict()
        self._stats.national_fencer_count[division][category][tournament.tournament_id] = 0

        for entry in competition.results:
            try:
                person = self.people[entry.fencer_id]
            except KeyError:
                print("Tournament {}, division {}, category {} - missing person {}.".format(
                    tournament.tournament_id, division.value, category.value, entry.fencer_id))
                person = find_person(entry.fencer_id, category.value)
                print("Attempted to find person at HR: \"{}\": {}".format(
                    entry.fencer_id, json.dumps(person, indent=2, ensure_ascii=False)))
                sys.exit(1)
            if person.club_id is not None:
                try:
                    club = self.clubs[person.club_id]
                except KeyError:
                    print("Person {} - missing club {}.".format(
                        person.id, person.club_id))
                    club = find_club(person.club_id)
                    print("Attempted to find club at HR: \"{}\": {}".format(
                        person.club_id, json.dumps(club, indent=2, ensure_ascii=False)))
                    sys.exit(1)
                nationality = club.country
            else:
                nationality = person.nationality

            if nationality != 'cz':
                continue

            self._stats.national_fencer_count[division][category][tournament.tournament_id] += 1

            if entry.fencer_id not in _intermediate_individual:
                _intermediate_individual[entry.fencer_id] = LadderIndividualEntry(
                    fencer_id=entry.fencer_id, tournaments=[], rank=0, last_season_rank=None)

            coeffs = [Coefficient(tournament.coefficient,
                                  CoefficientType.TOURNAMENT)]
            if entry.rank == 1:
                coeffs.append(Coefficient(
                    self.settings.rank_coefficients[0], CoefficientType.RANK_1))
            if entry.rank == 2:
                coeffs.append(Coefficient(
                    self.settings.rank_coefficients[1], CoefficientType.RANK_2))
            if entry.rank == 3:
                coeffs.append(Coefficient(
                    self.settings.rank_coefficients[2], CoefficientType.RANK_3))
            if entry.rank == 4:
                coeffs.append(Coefficient(
                    self.settings.rank_coefficients[3], CoefficientType.RANK_4))

            if tournament.country != nationality:
                coeffs.append(Coefficient(
                    self.settings.foreign_tournament_coefficient, CoefficientType.FOREIGN))

            # if self.settings.category_ranking[person.category] < self.settings.category_ranking[category]:
            #    coeffs.append(Coefficient(
            #        self.settings.higher_category_coefficient, CoefficientType.HIGHER_CATEGORY))

            _intermediate_individual[entry.fencer_id].tournaments.append(TournamentLadderEntry(
                tournament_id=tournament.tournament_id,
                coefficients=coeffs,
                base_points=self.get_base_points(competition, entry.rank),
                rank=entry.rank
            ))

    def get_base_points(self, competition: Competition, rank: int) -> int:
        return competition.no_participants - rank + 1

    @staticmethod
    def sorted_entries(entries: Sequence[LadderIndividualEntry]) -> Sequence[LadderIndividualEntry]:
        def key(e: LadderIndividualEntry) -> Tuple:
            return (
                -e.points(),
                sum(map(lambda t: t.rank, e.tournaments)) / len(e.tournaments),
                # -len(e.tournaments)
            )
        srt = sorted([(key(e), e) for e in entries], key=lambda x: x[0])
        final = [LadderIndividualEntry(fencer_id=srt[0][1].fencer_id,
                                       rank=1, tournaments=srt[0][1].tournaments, last_season_rank=None)]
        for i in range(1, len(srt)):
            k, e = srt[i]
            k_prev, _ = srt[i - 1]
            if k_prev == k:
                final.append(LadderIndividualEntry(
                    fencer_id=e.fencer_id, rank=final[-1].rank, tournaments=e.tournaments, last_season_rank=None))
            else:
                final.append(LadderIndividualEntry(
                    fencer_id=e.fencer_id, rank=len(final) + 1, tournaments=e.tournaments, last_season_rank=None))

        return final

    @staticmethod
    def find_previous_rank(fencer_id: str, previous_ladder: LadderIndividual) -> Optional[int]:
        for e in previous_ladder:
            if e.fencer_id == fencer_id:
                return e.rank
        return None


def main():
    data_dir = pathlib.Path(__file__).parent.parent.joinpath('public', 'data')

    people = read_json(data_dir.joinpath('people.json'))
    clubs = read_json(data_dir.joinpath('clubs.json'))

    seasons = read_json(data_dir.joinpath('seasons.json'))

    ladders_individual = dict()
    for season in sorted(seasons, key=lambda s: s["name"]):
        tournaments = read_json(data_dir.joinpath(
            'seasons', season['folder'], 'tournaments.json'))
        builder = Builder(
            tournaments, people, clubs, LadderSettings.from_dict(season['settings']))
        ladders_individual, ladders_club, stats = builder.build(
            ladders_individual)
        write_json(data_dir.joinpath('seasons', season['folder'], 'ladders-individual.json'),
                   ladders_individual_to_dict(ladders_individual))
        write_json(data_dir.joinpath('seasons', season['folder'], 'ladders-club.json'),
                   ladders_club_to_dict(ladders_club))
        write_json(data_dir.joinpath(
            'seasons', season['folder'], 'stats.json'), stats.to_dict())


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
    with open(path, 'w') as f:
        json.dump(obj, f, indent=2)


if __name__ == '__main__':
    main()
