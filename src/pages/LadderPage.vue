<template>
  <q-page class="row items-top justify-evenly">
    <q-table
      ref="table"
      :columns="columns"
      :rows="ladder"
      row-key="fencer_id"
      :pagination="{ rowsPerPage: 0, sortBy: 'rank', descending: false }"
      binary-state-sort
      hide-bottom
      square
      :style="style"
    >
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
    <ladder-detail
      v-model="detailTarget"
      :division="division"
      :category="category"
      @tournament-detail="onTournamentDetail"
    ></ladder-detail>
    <tournament-detail v-model="tournamentDetail"></tournament-detail>
  </q-page>
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
</style>

<script setup lang="ts">
import { QTableProps } from 'quasar';
import {
  Division,
  Category,
  Ladder,
  LadderEntry,
  loadTournaments,
  loadLadders,
} from 'src/logic/ladder';
import { useI18n } from 'vue-i18n';
import { useData } from 'src/stores/data';
import { ComputedRef, Ref } from 'vue';
import { computed, ref } from '@vue/reactivity';
import LadderDetail from 'src/components/LadderDetail.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import TournamentDetail from 'src/components/TournamentDetail.vue';
import { TournamentDetailModel } from 'src/components/models';

const { t } = useI18n();

const data = useData();

const props = defineProps<{
  season: string;
  division: Division;
  category: Category;
}>();

data.tournaments = await loadTournaments(props.season);
data.ladders = await loadLadders(props.season);

const columns: ComputedRef<QTableProps['columns']> = computed(
  (): QTableProps['columns'] => [
    {
      name: 'rank',
      label: t('ladderTable.rankLabel'),
      field: (row: LadderEntry) => row.rank,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'name',
      label: t('ladderTable.nameLabel'),
      field: (row: LadderEntry) => data.people[row.fencer_id].name,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'surname',
      label: t('ladderTable.surnameLabel'),
      field: (row: LadderEntry) => data.people[row.fencer_id].surname,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'club',
      label: t('ladderTable.clubLabel'),
      field: (row: LadderEntry) =>
        data.clubs[data.people[row.fencer_id].club_id]?.name,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'points',
      label: t('ladderTable.pointsLabel'),
      field: (row: LadderEntry) => row.points,
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

const ladder: ComputedRef<Ladder> = computed((): Ladder => {
  const res = data.ladders?.[props.division]?.[props.category];
  if (res === undefined) {
    throw Error('undefined ladder');
  }
  return res;
});

let style = {
  width: '100%',
  height: '300px',
};

function handleResize() {
  style.height = window.innerHeight - 50 + 'px';
}

window.addEventListener('resize', handleResize);
handleResize();

let detailTarget: Ref<LadderEntry | null> = ref(null);

function onDetailClick(entry: LadderEntry) {
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
