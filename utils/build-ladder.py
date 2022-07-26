import enum
import json
import pathlib
from dataclasses import dataclass
from math import prod
from typing import Any, List, Mapping, Sequence, Tuple, Union


class Category(enum.Enum):
    MEN_OPEN = 'mo'
    WOMEN = 'w'


class Division(enum.Enum):
    LS = 'ls'
    SB = 'sb'
    R = 'r'
    RD = 'rd'


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
    id: str
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
                    TournamentResultEntry(entry['id'], int(entry['rank'])) for entry in v2['results']
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
        self.club_id = raw['clubID']
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
            "points": self.points(),
            "coefficients": [
                coeff.to_dict() for coeff in self.coefficients
            ]
        }


@dataclass
class LadderEntry:
    fencer_id: str
    rank: int
    tournaments: List[TournamentLadderEntry]

    def points(self) -> int:
        return sum(map(lambda x: x.points(), self.tournaments))

    def to_dict(self) -> dict:
        return {
            "fencer_id": self.fencer_id,
            "rank": self.rank,
            "points": self.points(),
            "tournaments": [
                tournament.to_dict() for tournament in self.tournaments
            ]
        }


Ladder = List[LadderEntry]
Ladders = Mapping[Division, Mapping[Category, Ladder]]


@dataclass
class LadderSettings:
    foreign_tournament_coefficient: float
    higher_category_coefficient: float
    rank_coefficients: Tuple[float, float, float, float]
    category_ranking: Mapping[Category, int]


class LadderBuilder:
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

        self._intermediate: dict[Division,
                                 dict[Category, dict[str, LadderEntry]]] = {}

    def build(self) -> Ladders:
        self._intermediate = {}
        for tournament in self.tournaments:
            for division in tournament.competitions:
                if division not in self._intermediate:
                    self._intermediate[division] = {}
                for category in tournament.competitions[division]:
                    if category not in self._intermediate[division]:
                        self._intermediate[division][category] = {}
                    self.process_competition(tournament, division, category)

        return {
            division: {
                category: self.sorted_entries(
                    self._intermediate[division][category].values())
                for category in self._intermediate[division]
            } for division in self._intermediate
        }

    def process_competition(self, tournament: Tournament, division: Division, category: Category):
        competition = tournament.competitions[division][category]
        _intermediate = self._intermediate[division][category]

        for entry in competition.results:
            person = self.people[entry.id]
            if person.club_id is not None:
                club = self.clubs[person.club_id]
                nationality = club.country
            else:
                nationality = person.nationality

            if nationality != 'cz':
                return

            if entry.id not in _intermediate:
                _intermediate[entry.id] = LadderEntry(entry.id, 0, [])

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

            if self.settings.category_ranking[person.category] < self.settings.category_ranking[category]:
                coeffs.append(Coefficient(
                    self.settings.higher_category_coefficient, CoefficientType.HIGHER_CATEGORY))

            _intermediate[entry.id].tournaments.append(TournamentLadderEntry(
                tournament_id=tournament.tournament_id,
                coefficients=coeffs,
                base_points=self.get_base_points(competition, entry.rank),
                rank=entry.rank
            ))

    def get_base_points(self, competition: Competition, rank: int) -> int:
        return competition.no_participants - rank + 1

    @staticmethod
    def sorted_entries(entries: Sequence[LadderEntry]) -> Sequence[LadderEntry]:
        def key(e: LadderEntry) -> Tuple:
            return (
                -e.points(),
                sum(map(lambda t: t.rank, e.tournaments)) / len(e.tournaments),
                # -len(e.tournaments)
            )
        srt = sorted([(key(e), e) for e in entries], key=lambda x: x[0])
        final = [LadderEntry(srt[0][1].fencer_id, 1, srt[0][1].tournaments)]
        for i in range(1, len(srt)):
            k, e = srt[i]
            k_prev, _ = srt[i - 1]
            if k_prev == k:
                final.append(LadderEntry(
                    e.fencer_id, final[-1].rank, e.tournaments))
            else:
                final.append(LadderEntry(
                    e.fencer_id, len(final) + 1, e.tournaments))

        return final


def main():
    data_dir = pathlib.Path(__file__).parent.parent.joinpath('public', 'data')

    people = read_json(data_dir.joinpath('people.json'))
    clubs = read_json(data_dir.joinpath('clubs.json'))

    seasons = read_json(data_dir.joinpath('seasons.json'))

    for season in seasons:
        tournaments = read_json(data_dir.joinpath(
            'seasons', season['folder'], 'tournaments.json'))
        builder = LadderBuilder(tournaments, people, clubs, LadderSettings(
            category_ranking={
                Category.MEN_OPEN: 10,
                Category.WOMEN: 5
            },
            foreign_tournament_coefficient=1.25,
            higher_category_coefficient=1.25,
            rank_coefficients=(1.5, 1.33, 1.25, 1.16)
        ))
        ladders = builder.build()
        write_json(data_dir.joinpath('seasons', season['folder'], 'ladders.json'),
                   ladders_to_dict(ladders))


def ladders_to_dict(ladders: Ladders) -> dict:
    return {
        division.value: {
            category.value: [
                entry.to_dict() for entry in c
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
