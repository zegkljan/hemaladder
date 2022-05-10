'use strict'

import { categoryOptions, tournamentsOptions, peopleOptions, allFilter } from './constants.js'

export default {
    data() {
        return {
            drawer: true,
            categoryOptions: categoryOptions,
            tournamentsOptions: tournamentsOptions,
            peopleOptions: peopleOptions,
            allFilter: allFilter
        }
    },
    methods: {
        toggleDrawer() {
            this.drawer = !this.drawer
        },
        routePeople(people) {
            return `/${people}/${this.$route.params['tournaments']}/${this.$route.params['category']}`
        },
        routeTournaments(tournaments) {
            return `/${this.$route.params['people']}/${tournaments}/${this.$route.params['category']}`
        },
        routeCategory(category) {
            return `/${this.$route.params['people']}/${this.$route.params['tournaments']}/${category}`
        },
    }
}