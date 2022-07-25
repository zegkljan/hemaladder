from dataclasses import dataclass
import enum
import json
import pathlib
from typing import Any, List, Mapping, Tuple

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
    self.results: Mapping[Division, Mapping[Category, List[TournamentResultEntry]]] = {
      for d,
    }

class LadderBuilder:
  def __init__(self, tournaments: dict, people: dict, clubs: dict) -> None:
    self.tournaments = tournaments
    self.people = people
    self.clubs = clubs

  def build(self):
    pass

class Category(enum.Enum):
  MEN_OPEN = 'mo'
  WOMEN = 'w'

class Division(enum.Enum):
  LS = 'ls'
  SB = 'sb'
  R = 'r'
  RD = 'rd'

class TournamentEntry:
  def __init__(self, id: str, category: Category, coefficients: List[float], points: int) -> None:
    self.id = id
    self.category = category
    self.coefficients = coefficients
    self.points = points

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

def main():
  data_dir = pathlib.Path(__file__).parent.parent.joinpath('public', 'data')

  tournaments = read_json(data_dir.joinpath('tournaments.json'))
  people = read_json(data_dir.joinpath('people.json'))
  clubs = read_json(data_dir.joinpath('clubs.json'))

  builder = LadderBuilder(tournaments, people, clubs)
  ladder = builder.build()

def read_json(path: pathlib.Path) -> dict:
  with open(path, 'r') as f:
    return json.load(f)

if __name__ == '__main__':
  main()
