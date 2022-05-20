import json


def check_tournament(tid, t, people):
  for division, categories in t['results'].items():
    for category, ranking in categories.items():
      for entry in ranking:
        rank = entry['rank']
        pid = entry['id']
        if pid not in people:
          print('Missing person ID {} (tournament ID {}, division {}, category {}, rank {})'.format(pid, tid, division, category, rank))


def check_person(pid, p, clubs):
  if p['clubID'] not in clubs:
    print('Missing club ID {} (person ID {})'.format(p['clubID'], pid))


def main():
  with open('public/data/clubs.json', 'r') as f:
    clubs = json.load(f)
  with open('public/data/people.json', 'r') as f:
    people = json.load(f)
  with open('public/data/tournaments.json', 'r') as f:
    tournaments: dict = json.load(f)

  for tid, t in tournaments.items():
    check_tournament(tid, t, people)

  for pid, p in people.items():
    check_person(pid, p, clubs)


if __name__ == '__main__':
  main()
