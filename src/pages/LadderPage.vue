<template>
  <q-page class="row items-top justify-evenly">
    <q-table
      ref="table"
      :columns="columns"
      :rows="ladder.entries"
      row-key="fencerID"
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
      :category="ladder.category"
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
  Category,
  FencerNationality,
  Ladder,
  TournamentsCountry,
  computeLadder,
  LadderEntry,
  Division,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  fencerCountry: FencerNationality;
  tournamentsCountry: TournamentsCountry;
  division: Division;
  category: Category;
}>();

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
      field: (row: LadderEntry) => data.people[row.fencerID].name,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'surname',
      label: t('ladderTable.surnameLabel'),
      field: (row: LadderEntry) => data.people[row.fencerID].surname,
      align: 'left',
      sortable: true,
      sort: (a: string, b: string) => a.localeCompare(b),
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'club',
      label: t('ladderTable.clubLabel'),
      field: (row: LadderEntry) =>
        data.clubs[data.people[row.fencerID].clubID].name,
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

const ladder: ComputedRef<Ladder> = computed(
  (): Ladder =>
    computeLadder(
      data.tournaments,
      data.people,
      data.clubs,
      props.division,
      props.category,
      props.fencerCountry != FencerNationality.ALL,
      {
        coefficients: {
          foreignTournament: 1.25,
          higherCategory: 1.25,
          place: {
            first: 1.5,
            second: 1.33,
            third: 1.25,
            fourth: 1.16,
          },
        },
        fencers: props.fencerCountry,
        tournaments: props.tournamentsCountry,
      }
    )
);

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
  fencerID: string;
  tournamentID: string;
  category: Category;
}) {
  tournamentDetail.value = { ...detail, division: props.division };
}
</script>
