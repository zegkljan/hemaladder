'use strict'

import { CZ, allFilter } from "./constants.js"

const people = {
    [CZ]: 'českých',
    [allFilter]: 'všech'
}

const tournaments = {
    [CZ]: 'českých',
    [allFilter]: 'všech'
}

const categories = {
    LSO: 'dlouhý meč muži/open',
    LSW: 'dlouhý meč ženy'
}

export default {
    template: `
    <div>Žebříček {{ ppl }} šermířů na {{ tour }} turnajích v kategorii {{ cat }}</div>
    `,
    props: ['people', 'tournaments', 'category'],
    computed: {
        ppl() {
            return people[this.people]
        },
        tour() {
            return tournaments[this.tournaments]
        },
        cat() {
            return categories[this.category]
        }
    }
}