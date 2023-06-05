<template>
  <q-table
    v-if="tournaments !== null"
    ref="table"
    :columns="columns"
    :rows="tournaments"
    row-key="id"
    :loading="tournaments === undefined"
    :pagination="{ rowsPerPage: 0, sortBy: 'date', descending: false }"
    binary-state-sort
    hide-bottom
    square
    :style="style"
  >
    <template v-slot:body-cell-country="props">
      <q-td :props="props">
        <country-flag :country="props.value" :shadow="true" size="normal" />
        <q-tooltip>
          {{ $t('countries.' + props.value) }}
        </q-tooltip>
      </q-td>
    </template>
    <template v-slot:body-cell-results="props">
      <q-td :props="props">
        <q-btn
          :href="props.row.results_link"
          target="_blank"
          icon="mdi-open-in-new"
          flat
          dense
          round
          :disable="props.row.results_link === undefined"
        >
        </q-btn>
        <q-tooltip v-if="props.row.id.startsWith('-')">
          {{ $t('resultsNoDetailTooltip') }}
        </q-tooltip>
        <q-tooltip v-else>
          {{ $t('resultsDetailTooltip') }}
        </q-tooltip>
      </q-td>
    </template>
    <template v-slot:body-cell-hemaratings="props">
      <q-td :props="props">
        <q-btn
          :href="'https://hemaratings.com/events/details/' + props.row.id"
          target="_blank"
          icon="mdi-open-in-new"
          flat
          dense
          round
          :disable="props.row.id.startsWith('-')"
        >
        </q-btn>
        <q-tooltip v-if="props.row.id.startsWith('-')">
          {{ $t('hemaratingsNoDetailTooltip') }}
        </q-tooltip>
        <q-tooltip v-else>
          {{ $t('hemaratingsDetailTooltip') }}
        </q-tooltip>
      </q-td>
    </template>
  </q-table>
  <div v-else>
    <div class="text-center text-h2" style="margin: 2rem">
      {{ $t('noData') }}
    </div>
  </div>
</template>

<style lang="scss">
.q-table__top,
.q-table__bottom,
thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #fff;
}
thead tr th {
  position: sticky;
  z-index: 1;
}
thead tr:first-child th {
  top: 0;
}
/* this is when the loading indicator appears */
.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px;
}
.table-scroll {
  opacity: 0.5;
}

.change {
  width: fit-content;
  max-width: fit-content;
  margin-left: auto;
  margin-right: auto;

  &.new {
    &::before {
      content: '★';
      color: gold;
    }
  }

  &.worse {
    &::before {
      position: unset;
      content: '▼';
      color: red;
    }
  }

  &.better {
    &::before {
      position: unset;
      content: '▲';
      color: green;
    }
  }
}
</style>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { QTableProps } from 'quasar';
import {
  Category,
  Division,
  TournamentResultEntry,
} from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { ComputedRef, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import CountryFlag from 'vue-country-flag-next';

type TournamentView = {
  id: string;
  name: string;
  date: Date;
  country: string;
  coefficient: number;
  noParticipants: number;
  results: TournamentResultEntry[];
  results_link?: string;
};

const { t, d } = useI18n();

const data = useData();

const props = defineProps<{
  season: string;
  division: Division;
  category: Category;
}>();

watchEffect(async () => {
  await data.loadSeason(props.season);
});

const columns: ComputedRef<QTableProps['columns']> = computed(
  (): QTableProps['columns'] => [
    {
      name: 'name',
      label: t('tournamentLabel'),
      field: (row: TournamentView): string => row.name,
      align: 'left',
      sortable: true,
      // style: 'width: 1px',
    },
    {
      name: 'date',
      label: t('dateLabel'),
      field: (row: TournamentView): Date => row.date,
      format: (val: Date): string => d(val),
      align: 'left',
      sortable: true,
      // style: 'width: 1px',
    },
    {
      name: 'country',
      label: t('countryLabel'),
      field: (row: TournamentView): string => row.country,
      align: 'left',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'noParticipants',
      label: t('noParticipantsLabel'),
      field: (row: TournamentView): number => row.noParticipants,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'coefficient',
      label: t('coefficientLabel'),
      field: (row: TournamentView): number => row.coefficient,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'results',
      label: t('resultsLabel'),
      field: '',
      align: 'center',
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'hemaratings',
      label: t('hemaratingsLabel'),
      field: '',
      align: 'center',
      // style: 'width: 1px; max-width: 1px',
    },
  ]
);

const tournaments: ComputedRef<TournamentView[] | undefined | null> = computed(
  (): TournamentView[] | undefined | null => {
    if (data.tournaments === undefined) {
      return undefined;
    } else {
      return Object.entries(data.tournaments).flatMap((entry) => {
        const tournamentID = entry[0];
        const tournament = entry[1];
        const comp = tournament.competitions[props.division]?.[props.category];
        if (comp === undefined) {
          return [];
        } else {
          return [
            {
              id: tournamentID,
              name: tournament.name,
              date: tournament.date,
              country: tournament.country,
              coefficient: tournament.coefficient,
              noParticipants: comp.no_participants,
              results: comp.results,
              results_link: comp.results_link
            },
          ];
        }
      });
    }
  }
);

let style = {
  width: '100%',
  height: '300px',
};

function handleResize() {
  style.height = window.innerHeight - 98 + 'px';
}

window.addEventListener('resize', handleResize);
handleResize();

</script>
