<template>
  <q-page class="row items-top justify-evenly">
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
import { computed, ref } from '@vue/reactivity';
import { QTableProps } from 'quasar';
import LadderDetail from 'src/components/LadderDetail.vue';
import { TournamentDetailModel } from 'src/components/models';
import { Category, Division, Ladder, LadderEntry } from 'src/logic/ladder';
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

const ladder: ComputedRef<Ladder | undefined | null> = computed(
  (): Ladder | undefined | null => {
    if (data.ladders === undefined) {
      return undefined;
    } else {
      const ldr = data.ladders[props.division]?.[props.category];
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
