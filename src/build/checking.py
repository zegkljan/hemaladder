import gzip
import html
import json
import os
import re
import http.client
import sys


def find_person(pid):
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
    nationality_find = re.findall(
        'flag-icon flag-icon-([a-z]*)', page)
    if name_find:
        name, surname = name_find[0].split(' ', maxsplit=1)
        name = html.unescape(name)
        surname = html.unescape(surname)
    else:
        raise ValueError(
            f'Name of fencer ID {pid} could not be retreived from HEMA Ratings.')

    new_entry = {
        'surname': surname,
        'name': name,
    }

    fencer_club_entry = None
    club = None
    if club_find:
        fencer_club_entry = (pid, club_find[0])
        club = find_club(club_find[0])
    if nationality_find:
        new_entry['nationality'] = nationality_find[0]

    return new_entry, fencer_club_entry, club


def find_club(cid):
    conn = http.client.HTTPSConnection('hemaratings.com')
    conn.request('GET', '/clubs/details/{}/'.format(cid))
    res = conn.getresponse()
    page = res.read()
    try:
        page = page.decode('utf-8')
    except:
        page = gzip.decompress(page)
        page = page.decode('utf-8')
    name_find = re.findall('<h2>(.*)</h2>', page,
                           flags=re.MULTILINE | re.DOTALL)
    country_find = re.findall('flag-icon flag-icon-([a-z]*)', page)
    name = 'N/A'
    country = 'N/A'
    if name_find:
        name = re.sub(
            '\s+', ' ', name_find[0], flags=re.MULTILINE).strip()
        name = html.unescape(name)
    if country_find:
        country = country_find[0]
    new_entry = {
        'name': name,
        'country': country
    }
    return new_entry


def check_tournament(tid, t, people):
    for division, categories in t['competitions'].items():
        for category, competition in categories.items():
            for entry in competition['results']:
                rank = entry['rank']
                pid = entry['fencer_id']
                if pid not in people:
                    new_entry = find_person(pid)
                    print('Missing person ID {} (tournament ID {}, division {}, category {}, rank {}) -- {}'.format(
                        pid, tid, division, category, rank, new_entry))


def check_people(people, clubs):
    checked_clubs = set()
    for pid, p in people.items():
        club_id = p.get('club_id', None)
        if club_id is not None and club_id not in clubs and club_id not in checked_clubs:
            checked_clubs.add(club_id)
            new_entry = find_club(club_id)
            print(
                'Missing club ID {} (person ID {}) -- {}'.format(p['club_id'], pid, new_entry))


def main():
    with open('public/data/clubs.json', 'r') as f:
        clubs = json.load(f)
    with open('public/data/people.json', 'r') as f:
        people = json.load(f)
    for season in os.listdir('public/data/seasons'):
        if not os.path.isdir(os.path.join('public/data/seasons', season)):
            continue
        print('--- SEASON', season, '---')
        with open(os.path.join('public/data/seasons', season, 'tournaments.json'), 'r') as f:
            tournaments: dict = json.load(f)

        for tid, t in tournaments.items():
            check_tournament(tid, t, people)

    print('--- PEOPLE, CLUBS ---')
    check_people(people, clubs)


if __name__ == '__main__':
    main()
