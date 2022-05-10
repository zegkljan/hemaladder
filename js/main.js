'use strict'

import root from './root-component.js'
import router from './router.js'

var app = Vue.createApp(root)

app.use(Quasar, {
    config: {
        /*
        brand: {
          // primary: '#e46262',
          // ... or all other brand colors
        },
        notify: {...}, // default set of options for Notify Quasar plugin
        loading: {...}, // default set of options for Loading Quasar plugin
        loadingBar: { ... }, // settings for LoadingBar Quasar plugin
        // ..and many more (check Installation card on each Quasar component/directive/plugin)
        */
    }
})
Quasar.lang.set(Quasar.lang.cs)
Quasar.iconSet.set(Quasar.iconSet.mdiV6)
app.use(router)

app.mount('#app')
