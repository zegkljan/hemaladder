<template>
  <q-table
    v-if="ladder !== null"
    ref="table"
    :columns="columns"
    :rows="ladder"
    row-key="club_id"
    :pagination="{ rowsPerPage: 0, sortBy: 'name', descending: false }"
    :loading="ladder === undefined"
    binary-state-sort
    hide-bottom
    square
    :style="style"
  >
    <template v-slot:header-cell-points="props">
      <q-th :props="props">
        {{ props.col.label }}
        <q-tooltip>
          {{ $t('clubsTable.pointsHeaderTooltip') }}
        </q-tooltip>
      </q-th>
    </template>
    <!-- <template v-slot:body-cell-details="props">
      <q-td :props="props">
        <q-btn
          @click="onDetailClick(props.row)"
          flat
          dense
          round
          icon="mdi-information-outline"
        />
      </q-td>
    </template> -->
  </q-table>
  <div v-else>
    <div class="text-center text-h2" style="margin: 2rem">
      {{ $t('noData') }}
    </div>
  </div>
  <!-- <ladder-detail
    v-if="ladder !== null"
    v-model="detailTarget"
    :division="division"
    :category="category"
    @tournament-detail="onTournamentDetail"
  ></ladder-detail> -->
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
  LadderClub,
  LadderClubEntry,
} from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { ComputedRef, watchEffect } from 'vue';
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
      name: 'name',
      label: t('clubLabel'),
      field: (row: LadderClubEntry): string =>
        row.club_id === undefined ? '_' : data.clubs[row.club_id].name,
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
      name: 'no-fencers',
      label: t('noFencersLabel'),
      field: (row: LadderClubEntry): number => row.fencers.length,
      align: 'right',
      sortable: true,
    },
    {
      name: 'points',
      label: t('pointsLabel'),
      field: (row: LadderClubEntry): number => row.points,
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    },
    {
      name: 'points-per-fencer',
      label: t('pointsPerFencerLabel'),
      field: (row: LadderClubEntry): number => row.points / row.fencers.length,
      format: (val: number): string => (Math.round(val * 10) / 10).toString(),
      align: 'right',
      sortable: true,
      // style: 'width: 1px; max-width: 1px',
    } /*
    {
      name: 'details',
      label: t('ladderTable.detailsLabel'),
      field: '',
      align: 'right',
      // style: 'width: 1px; max-width: 1px',
    }, */,
  ]
);

const ladder: ComputedRef<LadderClub | undefined | null> = computed(
  (): LadderClub | undefined | null => {
    if (data.laddersClub === undefined) {
      return undefined;
    } else {
      const ldr = data.laddersClub[props.division]?.[props.category];
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

</script>
