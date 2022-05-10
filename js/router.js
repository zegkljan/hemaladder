'use strict'

import { categoryOptions, tournamentsOptions, peopleOptions } from './constants.js'
import ladderView from './ladder-view.js'
import header from './header.js'

const routes = [
    {
        path: '/', redirect: `/${peopleOptions[0]}`
    },
    {
        path: '/:people', redirect: to => `/${to.params['people']}/${tournamentsOptions[0]}`
    },
    {
        path: '/:people/:tournaments', redirect: to => `/${to.params['people']}/${to.params['tournaments']}/${categoryOptions[0]}`
    },
    {
        path: '/:people/:tournaments/:category',
        components: {
            header: header,
            default: ladderView
        },
        props: {
            header: true,
            default: false
        }
    }
]

export default VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes, // short for `routes: routes`
})