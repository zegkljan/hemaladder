<template>
  <q-table
    v-if="ladder !== null"
    ref="table"
    :columns="columns"
    :rows="ladder"
    row-key="fencer_id"
    :pagination="{ rowsPerPage: 0, sortBy: 'rank', descending: false }"
    :loading="ladder === undefined"
    binary-state-sort
    hide-bottom
    square
    :style="style"
  >
    <template v-slot:header-cell-previous-season-change="props">
      <q-th :props="props">
        {{ props.col.label }}
        <q-tooltip>
          {{ $t('ladderTable.previousSeasonChangeTooltip') }}
        </q-tooltip>
      </q-th>
    </template>
    <template v-slot:body-cell-previous-season-change="props">
      <q-td :props="props">
        <template v-if="props.value === null">
          <div class="change new">
            {{ props.value }}
          </div>
          <q-tooltip>{{
            $t('ladderTable.previousSeasonChangeNewInSeasonTooltip')
          }}</q-tooltip>
        </template>
        <template v-else-if="props.value === 0">
          <q-tooltip>{{
            $t('ladderTable.previousSeasonChangeNoChangeTooltip')
          }}</q-tooltip>
        </template>
        <template v-else-if="props.value > 0">
          <div class="change worse">
            {{ props.value }}
          </div>
          <q-tooltip v-if="props.value == -1">{{
            t('ladderTable.previousSeasonChangeWorseTooltip.n1')
          }}</q-tooltip>
          <q-tooltip v-else-if="props.value > -5">{{
            t('ladderTable.previousSeasonChangeWorseTooltip.n2', props.value)
          }}</q-tooltip>
          <q-tooltip v-else>{{
            t('ladderTable.previousSeasonChangeWorseTooltip.n5', props.value)
          }}</q-tooltip>
        </template>
        <template v-else-if="props.value < 0">
          <div class="change better">
            {{ -props.value }}
          </div>
          <q-tooltip v-if="props.value == -1">{{
            t('ladderTable.previousSeasonChangeBetterTooltip.n1')
          }}</q-tooltip>
          <q-tooltip v-else-if="props.value > -5">{{
            t('ladderTable.previousSeasonChangeBetterTooltip.n2', -props.value)
          }}</q-tooltip>
          <q-tooltip v-else>{{
            t('ladderTable.previousSeasonChangeBetterTooltip.n5', -props.value)
          }}</q-tooltip>
        </template>
      </q-td>
    </template>
    <template v-slot:body-cell-details="props">
      <q-td :props="props">
        <q-btn
          @click="onDetailClick(props.row)"
          flat
          dense
          round
          icon="mdi-information-outline"
        />
      </q-td>
    </template>
  </q-table>
  <div v-else>
    <div class="text-center text-h2" style="margin: 2rem">
      {{ $t('noData') }}
    </div>
  </div>
  <ladder-detail
    v-if="ladder !== null"
    v-model="detailTarget"
    :division="division"
    :category="category"
    @tournament-detail="onTournamentDetail"
  ></ladder-detail>
  <!-- <tournament-detail v-model="tournamentDetail"></tournament-detail> -->
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
import { computed, ref } from '@vue/reactivity';
import { QTableProps } from 'quasar';
import LadderDetail from 'src/components/LadderDetail.vue';
import { TournamentDetailModel } from 'src/components/models';
import {
  Category,
  Division,
  LadderIndividual,
  LadderIndividualEntry,
} from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { ComputedRef, Ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
      name: 'rank',
      label: t('ladderTable.rankLabel'),
      field: (row: LadderIndividualEntry) => row.rank,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'previous-season-change',
      label: t('ladderTable.previousSeasonChangeLabel'),
      field: (row: LadderIndividualEntry): number | null => {
        if (row.last_season_rank === undefined) {
          return null;
        }
        return row.rank - row.last_season_rank;
      },
      align: 'center',
      sortable: true,
      style: 'width: fit-content; max-width: fit-content',
      headerStyle: 'width: fit-content; max-width: fit-content',
    },
    {
      name: 'name',
      label: t('ladderTable.nameLabel'),
      field: (row: LadderIndividualEntry) => data.people[row.fencer_id].name,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'surname',
      label: t('ladderTable.surnameLabel'),
      field: (row: LadderIndividualEntry) => data.people[row.fencer_id].surname,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'club',
      label: t('clubLabel'),
      field: (row: LadderIndividualEntry) => {
        const clubId = data.people[row.fencer_id].club_id;
        return clubId === undefined
          ? '_'
          : data.clubs[data.people[row.fencer_id].club_id].name;
      },
      format: (val: string): string => (val === '_' ? t('noClub') : val),
      align: 'left',
      sortable: true,
      sort: (a: string, b: string): number => {
        if (a === '_') {
          return b === '_' ? 0 : 1;
        }
        if (b === '_') {
          return a === '_' ? 0 : -1;
        }
        return a.localeCompare(b);
      },
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'points',
      label: t('pointsLabel'),
      field: (row: LadderIndividualEntry) => row.points,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'details',
      label: t('ladderTable.detailsLabel'),
      field: '',
      align: 'right',
      // style: 'width: 1px; max-width: 1px',
    },
  ]
);

const ladder: ComputedRef<LadderIndividual | undefined | null> = computed(
  (): LadderIndividual | undefined | null => {
    if (data.laddersIndividual === undefined) {
      return undefined;
    } else {
      const ldr = data.laddersIndividual[props.division]?.[props.category];
      if (ldr === undefined) {
        return null;
      } else {
        return ldr;
      }
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

let detailTarget: Ref<LadderIndividualEntry | null> = ref(null);

function onDetailClick(entry: LadderIndividualEntry) {
  detailTarget.value = entry;
}

let tournamentDetail: Ref<TournamentDetailModel | null> = ref(null);

function onTournamentDetail(detail: {
  fencer_id: string;
  tournament_id: string;
  category: Category;
}) {
  tournamentDetail.value = { ...detail, division: props.division };
}
</script>
