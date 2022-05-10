'use strict'

import { categoryOptions } from './constants.js'
import { getLadder } from './ladder.js'

export default {
    template: `
    <q-page>
        <q-table
            ref="table"
            :loading="ladderLoading"
            :rows="ladder"
            :columns="columns"
            row-key="participantID"
            v-model:pagination="pagination"
            hide-pagination
            square
            flat
        >
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th style="padding: 0;"/>
                    <q-th
                        v-for="(col, i) in props.cols"
                        :key="col.name"
                        :props="props"
                    >
                        {{ col.label }}
                    </q-th>
                    <q-th  style="width: 1px; max-width: 1px">
                        <q-btn @click="toggleExpandAll()" size="sm" flat dense :icon="headerExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'">
                            <q-tooltip>{{ headerExpanded ? 'Zabalit vše' : 'Rozbalit vše' }}</q-tooltip>
                        </q-btn>
                    </q-th>
                    <q-th style="padding: 0;"/>
                </q-tr>
            </template>
            <template v-slot:body="props">
                <q-tr :props="props" @click="props.expand = !props.expand; headerExpanded = props.expand" class="cursor-pointer">
                    <q-td :style="[{padding: 0}, props.expand ? {'border-bottom': 'none'} : {}]"></q-td>
                    <q-td
                        v-for="col in props.cols"
                        :key="col.name"
                        :props="props"
                        :style="props.expand ? {'border-bottom': 'none'} : {}"
                    >
                        {{ col.value }}
                    </q-td>
                    <q-td class="text-left" :style="[{width: '1px', 'max-width': '1px'}, props.expand ? {'border-bottom': 'none'} : {}]">
                        <q-btn size="sm" flat dense @click.stop="props.expand = !props.expand; headerExpanded = props.expand" :icon="props.expand ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                    </q-td>
                    <q-td :style="[{padding: 0}, props.expand ? {'border-bottom': 'none'} : {}]"></q-td>
                </q-tr>
                <q-tr v-if="props.expand" :props="props" no-hover>
                    <q-dialog v-model="props.row.tournamentsDialog" style="width: fit-content; max-width: fit-content;">
                        <q-markup-table style="width: fit-content; max-width: fit-content;">
                            <q-btn @click="props.row.tournamentsDialog = false" flat icon="close" size="12px" class="absolute-top-right">
                                <q-tooltip>
                                    Zavřít
                                </q-tooltip>
                            </q-btn>
                            <thead>
                                <tr>
                                    <th colspan="7">
                                        <div class="text-h6 q-ml-md">Účast na turnajích</div>
                                    </th>
                                </tr>
                                <tr>
                                    <th class="text-left">Turnaj</th>
                                    <th class="text-center">Datum</th>
                                    <th class="text-center">Země</th>
                                    <th class="text-center">Umístění</th>
                                    <th class="text-center">Koeficient</th>
                                    <th class="text-center">Počet bodů</th>
                                    <th class="text-center">Detail turnaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="t in props.row.tournaments" :key="props.row.participantID + '-' + t.tournamentID">
                                    <td class="text-left">{{ t.tournament.name }}</td>
                                    <td class="text-center">{{ t.tournament.date }}</td>
                                    <td class="text-center">{{ t.tournament.country }}</td>
                                    <td class="text-center">{{ t.tournament.categories[$route.params['category']].indexOf(props.row.participantID) + 1 }}</td>
                                    <td class="text-center">{{ t.tournament.coefficient }}</td>
                                    <td class="text-center">{{ t.points }}</td>
                                    <td class="text-center">
                                        <q-btn v-if="t.tournamentID > 0" :href="'https://hemaratings.com/events/details/' + t.tournamentID" target="_blank" flat icon="mdi-open-in-new"></q-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </q-markup-table>
                    </q-dialog>
                    <q-td colspan="100%">
                        <div class="row justify-center">
                            <div class="col col-md-auto">
                                <q-item v-if="props.row.club" v-bind="props.row.participant.club > 0 ? {href: 'https://hemaratings.com/clubs/details/' + props.row.participant.club} : {}" target="_blank">
                                    <q-item-section>
                                        <q-item-label>Klub</q-item-label>
                                        <q-item-label caption>{{ props.row.club.name }}</q-item-label>
                                    </q-item-section>
                                    <q-item-section v-if="props.row.participant.club > 0" side>
                                        <q-icon name="mdi-open-in-new"></q-icon>
                                    </q-item-section>
                                </q-item>
                                <q-item v-else>
                                    <q-item-section>
                                        <q-item-label>Klub</q-item-label>
                                        <q-item-label caption>N/A</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </div>
                            <div class="col col-md-auto">
                                <q-item clickable @click="props.row.tournamentsDialog = true">
                                    <q-tooltip>
                                        Zobrazit detaily
                                    </q-tooltip>
                                    <q-item-section>
                                        <q-item-label>Počet turnajů</q-item-label>
                                        <q-item-label caption>{{ props.row.tournaments.length }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </div>
                            <div class="col col-md-auto">
                                <q-item>
                                    <q-item-section>
                                        <q-item-label>Průměrný počet bodů na turnaj</q-item-label>
                                        <q-item-label caption>{{ Math.round(props.row.points / props.row.tournaments.length * 100) / 100 }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </div>
                            <div v-if="props.row.participantID > 0" class="col col-md-auto">
                                <q-item :href="'https://hemaratings.com/fighters/details/' + props.row.participantID" target="_blank">
                                    <q-item-section>HEMA Ratings profil</q-item-section>
                                    <q-item-section side>
                                        <q-icon name="mdi-open-in-new"></q-icon>
                                    </q-item-section>
                                </q-item>
                            </div>
                        </div>
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <q-footer bordered class="bg-white text-black q-py-sm">
            <div class="row justify-center items-center">
                <div style="margin-right: .5em;">Řádek na stránku:</div>
                <q-select v-model="pagination.rowsPerPage" :options="perPageOptions" :option-label="o => o == 0 ? 'vše' : o" dense options-dense/>
                <q-pagination
                    v-model="pagination.page"
                    :max="pagesNumber"
                    input
                ></q-pagination>
            </div>
        </q-footer>
    </q-page>
    `,
    created() {
        this.buildLadder(this.$route.params)
        this.$watch(
            () => this.$route.params,
            (toParams, previousParams) => {
                this.buildLadder(toParams)
            }
        )
    },
    data() {
        return {
            categoryOptions: categoryOptions,
            ladderLoading: true,
            ladder: [],
            headerExpanded: false,
            columns: [
                {
                    name: 'rank',
                    label: 'Pořadí',
                    field: 'rank',
                    align: 'right',
                    style: 'width: 1px; max-width: 1px'
                },
                {
                    name: 'name',
                    label: 'Jméno',
                    field: row => row.participant.name,
                    align: 'right',
                    style: 'width: 1px; max-width: 1px'
                },
                {
                    name: 'surname',
                    label: 'Příjmení',
                    field: row => row.participant.surname,
                    align: 'right',
                    style: 'width: 1px; max-width: 1px'
                },
                {
                    name: 'points',
                    label: 'Počet bodů',
                    field: 'points',
                    align: 'right',
                    style: 'width: 1px; max-width: 1px'
                }
            ],
            pagination: {
                sortBy: 'desc',
                descending: false,
                page: 1,
                rowsPerPage: 10
            },
            perPageOptions: [5, 10, 15, 20, 50, 0]
        }
    },
    computed: {
        pagesNumber() {
            return this.ladderLoading || this.pagination.rowsPerPage == 0 ? 1 : Math.ceil(this.ladder.length / this.pagination.rowsPerPage)
        }
    },
    methods: {
        buildLadder(params) {
            this.ladderLoading = true
            getLadder(params['category'], params['tournaments'], params['people'])
                .then(l => {
                    this.ladder = l.map(v => {
                        v.tournamentsDialog = false
                        return v
                    })
                    this.ladderLoading = false
                    this.$refs.table.setExpanded([])
                })
        },
        toggleExpandAll() {
            this.headerExpanded = !this.headerExpanded
            let expanded = []
            if (this.headerExpanded) {
                expanded = this.ladder.map(row => row.participantID) 
            }
            this.$refs.table.setExpanded(expanded)
        }
    }
}