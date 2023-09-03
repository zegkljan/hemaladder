<template>
  <q-dialog v-model="shown">
    <q-card class="fit-content">
      <q-card-section class="row">
        <div class="text-h6 q-mr-md">
          {{ data.tournaments![modelValue!.tournament_id].name }}
        </div>
        <q-btn
          :href="'https://hemaratings.com/events/details/' + modelValue!.tournament_id"
          target="_blank"
          icon="mdi-open-in-new"
          flat
          dense
          round
        >
          <q-tooltip>
            {{ $t('ladderTable.tournamentDetail.hemaratingsDetailTooltip') }}
          </q-tooltip>
        </q-btn>
      </q-card-section>

      <div class="scroll-x">
        <q-markup-table square flat class="fit-content my-sticky-header-table">
          <thead>
            <tr>
              <th class="text-center">
                {{ $t('ladderTable.fencerDetail.rank') }}
              </th>
              <th class="text-left">
                {{ $t('ladderTable.nameLabel') }}
              </th>
              <th class="text-left">
                {{ $t('ladderTable.surnameLabel') }}
              </th>
              <th class="text-left">
                {{ $t('ladderTable.clubLabel') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in modelValue!.competition!.results"
              :key="p.fencer_id"
              :class="{'highlight': p.fencer_id == modelValue!.fencer_id}"
            >
              <td class="text-left">
                {{ p.rank }}
              </td>
              <td class="text-left">
                {{ data.people[p.fencer_id].name }}
              </td>
              <td class="text-left">
                {{ data.people[p.fencer_id].surname }}
              </td>
              <td class="text-left">
                {{
                  data.peopleClubs?.[p.fencer_id] === undefined
                    ? t('noClub')
                    : data.clubs[data.peopleClubs?.[p.fencer_id]].name
                }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <q-separator />
      <q-card-actions align="right" class="text-primary">
        <q-btn
          v-close-popup
          flat
          :label="t('ladderTable.fencerDetail.close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.fit-content {
  width: fit-content;
  max-width: fit-content !important;
}

.highlight {
  font-weight: bold;
}

.my-sticky-header-table {
  /* height or max-height is important */
  max-height: calc(100vh - 227px);

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
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useData } from 'src/stores/data';
import { computed } from '@vue/reactivity';
import { TournamentDetailModel } from './models';

const { t } = useI18n();

const data = useData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: TournamentDetailModel | null;
}>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  (e: 'update:modelValue', value: TournamentDetailModel | null): void;
}>();

const shown = computed<boolean>({
  get() {
    return props.modelValue != null;
  },
  set(value: boolean) {
    emit('update:modelValue', value ? props.modelValue : null);
  },
});
</script>
