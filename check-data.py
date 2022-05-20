import gzip
import json
import re
import http.client


def check_tournament(tid, t, people):
  for division, categories in t['results'].items():
    for category, ranking in categories.items():
      for entry in ranking:
        rank = entry['rank']
        pid = entry['id']
        if pid not in people:
          conn = http.client.HTTPSConnection('hemaratings.com')
          conn.request('GET', '/fighters/details/{}/'.format(pid))
          res = conn.getresponse()
          page = res.read()
          try:
            page = page.decode('utf-8')
          except:
            page = gzip.decompress(page)
            page = page.decode('utf-8')
          name_find = re.findall('<h2>(.*)</h2>', page)
          club_find = re.findall('/clubs/details/([0-9]*)/', page)
          nationality_find = re.findall('flag-icon flag-icon-([a-z]*)', page)
          if name_find:
            name, surname = name_find[0].split(' ', maxsplit=2)
          if club_find:
            club = club_find[0]
          if nationality_find:
            nationality = nationality_find[0]
          new_entry = f'"{pid}": {{"surname": "{surname}", "name": "{name}", "clubID": "{club}", "nationality": "{nationality}", "category": "{category}"}}'
          print('Missing person ID {} (tournament ID {}, division {}, category {}, rank {}) -- {}'.format(pid, tid, division, category, rank, new_entry))


def check_people(people, clubs):
  checked_clubs = set()
  for pid, p in people.items():
    club_id = p['clubID']
    if club_id not in clubs and club_id not in checked_clubs:
      checked_clubs.add(club_id)
      conn = http.client.HTTPSConnection('hemaratings.com')
      conn.request('GET', '/clubs/details/{}/'.format(club_id))
      res = conn.getresponse()
      page = res.read()
      try:
        page = page.decode('utf-8')
      except:
        page = gzip.decompress(page)
        page = page.decode('utf-8')
      name_find = re.findall('<h2>(.*)</h2>', page, flags=re.MULTILINE|re.DOTALL)
      country_find = re.findall('flag-icon flag-icon-([a-z]*)', page)
      name = 'N/A'
      country = 'N/A'
      if name_find:
        name = re.sub('\s+', ' ', name_find[0], flags=re.MULTILINE).strip()
      if country_find:
        country = country_find[0]
      new_entry = f'"{club_id}": {{"name": "{name}", "country": "{country}"}}'
      print('Missing club ID {} (person ID {}) -- {}'.format(p['clubID'], pid, new_entry))


def main():
  with open('public/data/clubs.json', 'r') as f:
    clubs = json.load(f)
  with open('public/data/people.json', 'r') as f:
    people = json.load(f)
  with open('public/data/tournaments.json', 'r') as f:
    tournaments: dict = json.load(f)

  for tid, t in tournaments.items():
    check_tournament(tid, t, people)

  check_people(people, clubs)


if __name__ == '__main__':
  main()
