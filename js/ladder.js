'use strict'

import { loadJSON, objectFilter } from './utils.js'
import { allFilter } from './constants.js'

export async function getLadder(categoryFilter, tournamentCountryFilter, peopleNationalityFilter) {
    const now = luxon.DateTime.now().startOf('day')
    const interval = luxon.Interval.fromDateTimes(now.minus({ years: 1 }), now)

    let tournaments = await loadJSON('data/tournaments.json')
    tournaments = objectFilter(tournaments, (k) => {
        const t = tournaments[k]
        if (categoryFilter != allFilter && t.category != categoryFilter) {
            return false
        }
        if (tournamentCountryFilter != allFilter && t.country != tournamentCountryFilter) {
            return false
        }

        const date = luxon.DateTime.fromISO(t.date)
        if (!interval.contains(date)) {
            return false
        }

        return true
    })

    let people = await loadJSON('data/people.json')
    people = objectFilter(people, (k) => peopleNationalityFilter == allFilter || people[k].nationality == peopleNationalityFilter)

    let clubs = await loadJSON('data/clubs.json')

    return computeLadder(tournaments, people, clubs)
}

function computeLadder(tournaments, people, clubs) {
    let intermediate = {}
    for (let tk in tournaments) {
        const t = tournaments[tk]
        const participants = t.ranking.length
        t.ranking.forEach((p, i) => {
            if (!people.hasOwnProperty(p)) {
                return
            }
            let coef = t.coefficient
            switch (i) {
                case 0:
                    coef = coef * 1.5
                    break
                case 1:
                    coef = coef * 1.33
                    break
                case 2:
                    coef = coef * 1.25
                    break
                case 3:
                    coef = coef * 1.16
            }
            const points = Math.round((participants - i) * coef)

            if (!intermediate.hasOwnProperty(p)) {
                intermediate[p] = {
                    points: 0,
                    tournaments: []
                }
            }
            intermediate[p].points = intermediate[p].points + points
            intermediate[p].tournaments.push({
                tournamentID: tk,
                tournament: t,
                points: points
            })
        });
    }

    return Object.keys(intermediate)
        .sort((a, b) => intermediate[b].points - intermediate[a].points)
        .map((k, i) => {
            return {
                rank: i + 1,
                participantID: k,
                participant: people[k],
                club: people[k].club ? clubs[people[k].club] : null,
                points: intermediate[k].points,
                tournaments: intermediate[k].tournaments
            }
        })
}