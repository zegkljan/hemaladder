<template>
  <q-markup-table square flat class="fit-content">
    <thead>
      <tr>
        <th class="text-left">
          {{ $t('tournamentLabel') }}
        </th>
        <th class="text-left">
          {{ $t('dateLabel') }}
        </th>
        <th class="text-center">
          {{ $t('countryLabel') }}
        </th>
        <th class="text-center">
          {{ $t('noParticipantsLabel') }}
        </th>
        <th class="text-center">
          {{ $t('ladderTable.fencerDetail.rank') }}
        </th>
        <th class="text-center">
          {{ $t('coefficientLabel') }}
        </th>
        <th class="text-center">
          {{ $t('ladderTable.fencerDetail.points') }}
        </th>
        <th class="text-center">
          {{ $t('ladderTable.fencerDetail.tournamentResultsLabel') }}
        </th>
        <th class="text-center">
          {{ $t('ladderTable.fencerDetail.tournamentDetailLabel') }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="t in tournaments" :key="t.tournament_id">
        <td class="text-left">
          {{ data.tournaments![t.tournament_id].name }}
          <q-badge
            v-if="data.tournaments![t.tournament_id].championship"
            name="mdi-trophy"
            color="transparent"
            text-color="black"
            class="coeff-badge"
            :class="{ hide: t.coefficients.length === 0 }"
          >
            <q-icon name="mdi-trophy" class="championship" size="larger" />
            <q-tooltip>
              {{ $t('championship') }}
            </q-tooltip>
          </q-badge>
        </td>
        <td class="text-left">
          {{ $d(data.tournaments![t.tournament_id].date) }}
        </td>
        <td class="text-center">
          <country-flag
            :country="data.tournaments![t.tournament_id].country"
            :shadow="true"
            size="normal"
          />
          <q-tooltip>
            {{ $t('countries.' + data.tournaments![t.tournament_id].country) }}
          </q-tooltip>
        </td>
        <td class="text-center">
          {{
            data.tournaments![t.tournament_id].competitions[division!]![
              category!
            ]!.no_participants
          }}
        </td>
        <td class="text-center">
          {{
            data.tournaments![t.tournament_id].competitions[division!]![
              category!
            ]!.results!.find((entry) => entry.fencer_id == fencerId)?.rank
          }}
        </td>
        <td class="text-right">
          {{
            Math.round(
              t.coefficients.map((c) => c.c).reduce((a, b) => a * b, 1) * 100
            ) / 100
          }}
          <q-badge
            color="transparent"
            text-color="black"
            class="coeff-badge"
            :class="{ hide: t.coefficients.length === 0 }"
          >
            <q-icon name="mdi-information-outline" />
            <q-tooltip>
              <table class="coefficient-tooltip" cellspacing="0">
                <tr v-for="c in t.coefficients" :key="c.type">
                  <td>
                    {{
                      $t('ladderTable.fencerDetail.coefficientType.' + c.type)
                    }}
                  </td>
                  <td class="text-right">{{ c.c }}</td>
                </tr>
                <tr>
                  <td>
                    {{ $t('ladderTable.fencerDetail.coefficientTotal') }}
                  </td>
                  <td class="text-right">
                    {{
                      Math.round(
                        t.coefficients
                          .map((c) => c.c)
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
          <div>
            <q-btn
              :href="resultsLink(t.tournament_id)"
              target="_blank"
              icon="mdi-open-in-new"
              flat
              dense
              round
              :disable="resultsLink(t.tournament_id) === undefined"
            >
            </q-btn>
            <q-tooltip v-if="resultsLink(t.tournament_id) === undefined">
              {{ $t('resultsNoDetailTooltip') }}
            </q-tooltip>
            <q-tooltip v-else>
              {{ $t('resultsDetailTooltip') }}
            </q-tooltip>
          </div>
        </td>
        <td class="text-center">
          <div>
            <q-btn
              :href="
                'https://hemaratings.com/events/details/' + t.tournament_id
              "
              target="_blank"
              icon="mdi-open-in-new"
              flat
              dense
              round
              :disable="t.tournament_id.startsWith('-')"
            >
            </q-btn>
            <q-tooltip v-if="t.tournament_id.startsWith('-')">
              {{ $t('hemaratingsNoDetailTooltip') }}
            </q-tooltip>
            <q-tooltip v-else>
              {{ $t('hemaratingsDetailTooltip') }}
            </q-tooltip>
          </div>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<style lang="scss">
.fit-content {
  width: fit-content;
  max-width: fit-content !important;
}

.championship {
  color: gold;
}

.coeff-badge {
  cursor: help;

  &.hide {
    visibility: hidden;
  }
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
</style>

<script setup lang="ts">
import { Division, Category, TournamentLadderEntry } from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import CountryFlag from 'vue-country-flag-next';

const data = useData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  fencerId: string;
  tournaments: TournamentLadderEntry[];
  division: Division | null;
  category: Category | null;
}>();

function resultsLink(tid: string): string | undefined {
  if (props.division === null || props.category === null) {
    return undefined;
  }
  return data.tournaments?.[tid].competitions[props.division]?.[props.category]
    ?.results_link;
}
</script>
