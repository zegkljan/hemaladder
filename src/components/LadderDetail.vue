<template>
  <q-dialog v-model="shown">
    <q-card class="fit-content">
      <q-card-section>
        <div class="text-h6">
          {{ data.people[modelValue!.fencer_id].name }}
          {{ data.people[modelValue!.fencer_id].surname }}
          <q-btn
            v-if="!modelValue!.fencer_id.startsWith('-')"
            :href="'https://hemaratings.com/fighters/details/' + modelValue!.fencer_id"
            target="_blank"
            icon="mdi-open-in-new"
            flat
            dense
            round
          >
            <q-tooltip>{{
              $t('ladderTable.fencerDetail.hemaratingsFencerLinkLabel')
            }}</q-tooltip>
          </q-btn>
          <span v-if="data.peopleClubs?.[modelValue!.fencer_id]" class="club">
            {{ data.clubs[data.peopleClubs[modelValue!.fencer_id]].name }}
            <q-btn
              v-if="!data.peopleClubs[modelValue!.fencer_id].startsWith('-')"
              :href="'https://hemaratings.com/clubs/details/' + data.peopleClubs[modelValue!.fencer_id]"
              target="_blank"
              icon="mdi-open-in-new"
              size="sm"
              flat
              dense
              round
            >
              <q-tooltip>{{
                $t('ladderTable.fencerDetail.hemaratingsClubLinkLabel')
              }}</q-tooltip>
            </q-btn>
          </span>
        </div>
      </q-card-section>

      <q-card-section v-if="modelValue!.uncounted_tournaments.length > 0">
        <q-expansion-item
          :label="$t('ladderTable.fencerDetail.countedTournaments')"
          :model-value="true"
          header-class="text-subtitle1 text-weight-medium"
        >
          <div class="table-container">
            <individual-tournaments-detail
              :fencer-id="modelValue!.fencer_id"
              :tournaments="modelValue!.counted_tournaments"
              :division="division"
              :category="category"
            />
          </div>
        </q-expansion-item>
        <q-expansion-item
          :label="$t('ladderTable.fencerDetail.uncountedTournaments')"
          header-class="text-subtitle1 text-weight-medium"
        >
          <div class="table-container">
            <individual-tournaments-detail
              :fencer-id="modelValue!.fencer_id"
              :tournaments="modelValue!.uncounted_tournaments"
              :division="division"
              :category="category"
            />
          </div>
        </q-expansion-item>
      </q-card-section>
      <q-card-section v-else>
        <individual-tournaments-detail
          :fencer-id="modelValue!.fencer_id"
          :tournaments="modelValue!.counted_tournaments"
          :division="division"
          :category="category"
        />
      </q-card-section>

      <q-separator />
      <q-card-actions align="right" class="text-primary">
        <q-btn v-close-popup flat :label="t('close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.fit-content {
  width: fit-content;
  max-width: fit-content !important;
}

.table-container {
  padding-left: 1em;
  padding-right: 1em;
}

.coeff-badge {
  cursor: help;
}

table.coefficient-tooltip {
  td {
    margin: 0px;
    padding: 2px;
    border: 0px;
  }

  tr:last-child {
    td {
      border-top: 1px solid white;
    }
  }
}

.club {
  margin-left: 1em;
  font-size: smaller;
  font-weight: normal;
}
</style>

<script setup lang="ts">
import { LadderIndividualEntry, Division, Category } from 'src/logic/ladder';
import IndividualTournamentsDetail from './IndividualTournamentsDetail.vue';
import { useI18n } from 'vue-i18n';
import { useData } from 'src/stores/data';
import { computed } from '@vue/reactivity';

const { t } = useI18n();

const data = useData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: LadderIndividualEntry | null;
  division: Division | null;
  category: Category | null;
}>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  (e: 'update:modelValue', value: LadderIndividualEntry | null): void;
  (
    e: 'tournamentDetail',
    value: {
      fencer_id: string;
      tournament_id: string;
      category: Category;
    }
  ): void;
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
