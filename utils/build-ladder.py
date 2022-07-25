from dataclasses import dataclass
import enum
import json
from math import prod
import pathlib
from typing import Any, List, Mapping, MutableMapping, Tuple
from unicodedata import category


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

class Tournament:
  def __init__(self, raw: dict) -> None:
    self.name: str = raw['name']
    self.date: str = raw['date']
    self.country: str = raw['country']
    self.coefficient: float = raw['coefficient']
    self.total_participants: int = raw['total_participants']
    self.results: Mapping[Division, Mapping[Category, List[TournamentResultEntry]]] = {
      Division(division_name): {
        Category(category_name): [
          TournamentResultEntry(entry["id"], entry["rank"]) for entry in category
        ] for category_name, category in division[division_name]
      } for division_name, division in raw["results"]
    }

@dataclass
class Person:
  id: str
  name: str
  surname: str
  clubID: str
  nationality: str
  category: Category

  def __init__(self, id: str, raw: dict) -> None:
    self.id = id
    self.name = raw["name"]
    self.surname = raw["surname"]
    self.clubID = raw["clubID"]
    self.nationality = raw["nationality"]
    self.category = Category(raw["category"])

@dataclass
class Club:
  id: str
  name: str
  country: str

  def __init__(self, id: str, raw: dict) -> None:
    self.id = id
    self.name = raw["name"]
    self.country = raw["country"]

@dataclass
class Coefficient:
  c: float
  c_type: CoefficientType

@dataclass
class TournamentEntry:
  id: str
  category: Category
  coefficients: List[Coefficient]
  base_points: float

  def points(self) -> int:
    return round(self.base_points * prod(map(lambda x: x.c, self.coefficients)))

class LadderEntry:
  def __init__(self, fencer_id: str, rank: int, points: int, tournaments: List[TournamentEntry]) -> None:
    self.fencer_id = fencer_id
    self.rank = rank
    self.points = points
    self.tournaments = tournaments

class Ladder:
  def __init__(self, division: Division, category: Category, entries: LadderEntry) -> None:
    self.division = division
    self.category = category
    self.entries = entries

class LadderBuilder:
  def __init__(self, tournaments: dict, people: dict, clubs: dict) -> None:
    self.tournaments: List[Tournament] = list(map(lambda x: Tournament(x[0], x[1]), tournaments.items()))
    self.people: List[Person] = list(map(lambda x: Person(x[0], x[1]), people.items()))
    self.clubs: List[Club] = list(map(lambda x: Club(x[0], x[1]), clubs.items()))

  def build(self) -> Ladder:
    intermediates: dict[Tuple[Division, Category], dict[str, TournamentEntry]] = {}
    for tournament in self.tournaments:
      for division, div_cont in tournament.results.items():
        for category, results in div_cont.items():
          intermediate = intermediates[(division, category)]
          if intermediate is None:
            intermediate = {}
            intermediates[(division, category)] = intermediate
          for result in results:
            if result.id not in intermediate:
              intermediate[result.id] = TournamentEntry(result.id, category, [], )

def main():
  data_dir = pathlib.Path(__file__).parent.parent.joinpath('public', 'data')

  people = read_json(data_dir.joinpath('people.json'))
  clubs = read_json(data_dir.joinpath('clubs.json'))

  seasons = read_json(data_dir.joinpath('seasons.json'))

  for season in seasons:
    tournaments = read_json(data_dir.joinpath('tournaments_{}.json'.format(season)))
    builder = LadderBuilder(tournaments, people, clubs)
    ladder = builder.build()

def read_json(path: pathlib.Path) -> dict:
  with open(path, 'r') as f:
    return json.load(f)

if __name__ == '__main__':
  main()
