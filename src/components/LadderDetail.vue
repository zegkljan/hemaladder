<template>
  <q-dialog v-model="shown">
    <q-card class="fit-content">
      <q-card-section>
        <div class="text-h6">
          {{ data.people[modelValue!.fencerID].name }}
          {{ data.people[modelValue!.fencerID].surname }}
        </div>
      </q-card-section>

      <q-tabs
        v-model="tab"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        dense
      >
        <q-tab name="fencer" :label="t('ladderTable.fencerDetail.fencer')" />
        <q-tab
          name="tournaments"
          :label="t('ladderTable.fencerDetail.tournaments')"
        />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="fencer">
          <div class="row">
            <div>
              <q-item
                v-if="data.people[modelValue!.fencerID].clubID"
                v-bind="data.people[modelValue!.fencerID].clubID.startsWith('-') ? {} : {href: 'https://hemaratings.com/clubs/details/' + data.people[modelValue!.fencerID].clubID}"
                target="_blank"
              >
                <q-item-section>
                  <q-item-label caption>{{
                    $t('ladderTable.clubLabel')
                  }}</q-item-label>
                  <q-item-label
                    >{{data.clubs[data.people[modelValue!.fencerID].clubID].name}}</q-item-label
                  >
                </q-item-section>
                <q-item-section
                  v-if="!data.people[modelValue!.fencerID].clubID.startsWith('-')"
                  side
                >
                  <q-icon name="mdi-open-in-new" />
                </q-item-section>
              </q-item>
              <q-item v-else>
                <q-item-section>
                  <q-item-label caption>{{
                    $t('ladderTable.clubLabel')
                  }}</q-item-label>
                  <q-item-label>-</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div>
              <q-item
                v-if="!modelValue!.fencerID.startsWith('-')"
                :href="'https://hemaratings.com/fighters/details/' + modelValue!.fencerID"
                target="_blank"
              >
                <q-item-section>
                  <q-item-label>{{
                    $t('ladderTable.fencerDetail.hemaratingsLinkLabel')
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-open-in-new" />
                </q-item-section>
              </q-item>
            </div>

            <div>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{
                    $t('ladderTable.fencerDetail.noTournamentsLabel')
                  }}</q-item-label>
                  <q-item-label
                    >{{ modelValue!.tournaments.length }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </div>

            <div>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{
                    $t('ladderTable.fencerDetail.avgPtsPerTournamentLabel')
                  }}</q-item-label>
                  <q-item-label
                    >{{ Math.round(modelValue!.points / modelValue!.tournaments.length * 100) / 100 }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel
          name="tournaments"
          style="padding-left: 0; padding-right: 0"
        >
          <q-markup-table square flat class="fit-content">
            <thead>
              <tr>
                <th class="text-left">
                  {{ $t('ladderTable.fencerDetail.tournament') }}
                </th>
                <th class="text-left">
                  {{ $t('categoryTitle') }}
                </th>
                <th class="text-left">
                  {{ $t('ladderTable.fencerDetail.date') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.country') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.noParticipants') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.rank') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.coefficient') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.points') }}
                </th>
                <th class="text-center">
                  {{ $t('ladderTable.fencerDetail.tournamentDetailLabel') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in modelValue!.tournaments"
                :key="t.tournamentID + t.category"
              >
                <td class="text-left">
                  {{ data.tournaments[t.tournamentID].name }}
                </td>
                <td class="text-left">
                  {{ $t('category.' + t.category) }}
                </td>
                <td class="text-left">
                  {{ $d(data.tournaments[t.tournamentID].date) }}
                </td>
                <td class="text-center">
                  {{ data.tournaments[t.tournamentID].country }}
                </td>
                <td class="text-center">
                  {{ data.tournaments[t.tournamentID].results[division!][t.category].length }}
                </td>
                <td class="text-center">
                  {{ data.tournaments[t.tournamentID].results[division!][t.category].find(entry => entry.id == modelValue!.fencerID)?.rank }}
                </td>
                <td class="text-right">
                  {{
                    Math.round(
                      t.coefficients
                        .map((c) => c.value)
                        .reduce((a, b) => a * b, 1) * 100
                    ) / 100
                  }}
                  <q-badge
                    color="transparent"
                    text-color="black"
                    class="coeff-badge"
                  >
                    <q-icon name="mdi-information-outline" />
                    <q-tooltip>
                      <table class="coefficient-tooltip" cellspacing="0">
                        <tr v-for="c in t.coefficients" :key="c.type">
                          <td>
                            {{
                              $t(
                                'ladderTable.fencerDetail.coefficientType.' +
                                  c.type
                              )
                            }}
                          </td>
                          <td class="text-right">{{ c.value }}</td>
                        </tr>
                        <tr>
                          <td>
                            {{
                              $t('ladderTable.fencerDetail.coefficientTotal')
                            }}
                          </td>
                          <td class="text-right">
                            {{
                              Math.round(
                                t.coefficients
                                  .map((c) => c.value)
                                  .reduce((a, b) => a * b, 1) * 100
                              ) / 100
                            }}
                          </td>
                        </tr>
                      </table>
                    </q-tooltip>
                  </q-badge>
                </td>
                <td class="text-center">
                  {{ t.points }}
                </td>
                <td class="text-center">
                  <q-btn
                    @click="onTournamentDetail(t.tournamentID, t.category)"
                    flat
                    dense
                    round
                    icon="mdi-information-outline"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-tab-panel>
      </q-tab-panels>

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

.highlight {
  font-weight: bold;
}
</style>

<script setup lang="ts">
import { LadderEntry, Division, Category } from 'src/logic/ladder';
import { useI18n } from 'vue-i18n';
import { useData } from 'src/stores/data';
import { ref } from 'vue';
import { computed } from '@vue/reactivity';

const { t } = useI18n();

const data = useData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  modelValue: LadderEntry | null;
  division: Division | null;
}>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  (e: 'update:modelValue', value: LadderEntry | null): void;
  (
    e: 'tournamentDetail',
    value: {
      fencerID: string;
      tournamentID: string;
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

const tab = ref('fencer');

function onTournamentDetail(tournamentID: string, category: Category) {
  emit('tournamentDetail', {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fencerID: props.modelValue!.fencerID,
    tournamentID: tournamentID,
    category: category,
  });
}
</script>
