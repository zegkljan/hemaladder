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
      <tr
        v-for="c in competitions"
        :key="c.tournament.tournament_id + (c.competition.subtitle ?? '')"
      >
        <td class="text-left">
          {{
            data.tournaments![c.tournament.tournament_id].name +
            (c.competition.subtitle === undefined
              ? ''
              : ' (' + c.competition.subtitle + ')')
          }}
          <q-badge
            v-if="data.tournaments![c.tournament.tournament_id].championship"
            name="mdi-trophy"
            color="transparent"
            text-color="black"
            class="coeff-badge"
            :class="{ hide: c.tournament.coefficients.length === 0 }"
          >
            <q-icon name="mdi-trophy" class="championship" size="larger" />
            <q-tooltip>
              {{ $t('championship') }}
            </q-tooltip>
          </q-badge>
        </td>
        <td class="text-left">
          {{ $d(data.tournaments![c.tournament.tournament_id].date) }}
        </td>
        <td class="text-center">
          <country-flag
            :country="data.tournaments![c.tournament.tournament_id].country"
            :shadow="true"
            size="normal"
          />
          <q-tooltip>
            {{
              $t(
                'countries.' +
                  data.tournaments![c.tournament.tournament_id].country
              )
            }}
          </q-tooltip>
        </td>
        <td class="text-center">
          {{ c.competition.no_participants }}
        </td>
        <td class="text-center">
          {{
            c.competition.results!.find((entry) => entry.fencer_id == fencerId)
              ?.rank
          }}
        </td>
        <td class="text-right">
          {{
            Math.round(
              c.tournament.coefficients
                .map((c) => c.c)
                .reduce((a, b) => a * b, 1) * 100
            ) / 100
          }}
          <q-badge
            color="transparent"
            text-color="black"
            class="coeff-badge"
            :class="{ hide: c.tournament.coefficients.length === 0 }"
          >
            <q-icon name="mdi-information-outline" />
            <q-tooltip>
              <table class="coefficient-tooltip" cellspacing="0">
                <tr v-for="coef in c.tournament.coefficients" :key="coef.type">
                  <td>
                    {{
                      $t(
                        'ladderTable.fencerDetail.coefficientType.' + coef.type
                      )
                    }}
                  </td>
                  <td class="text-right">{{ coef.c }}</td>
                </tr>
                <tr>
                  <td>
                    {{ $t('ladderTable.fencerDetail.coefficientTotal') }}
                  </td>
                  <td class="text-right">
                    {{
                      Math.round(
                        c.tournament.coefficients
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
          {{ c.tournament.points }}
        </td>
        <td class="text-center">
          <div>
            <q-btn
              :href="c.competition.results_link"
              target="_blank"
              icon="mdi-open-in-new"
              flat
              dense
              round
              :disable="c.competition.results_link === undefined"
            >
            </q-btn>
            <q-tooltip v-if="c.competition.results_link === undefined">
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
                'https://hemaratings.com/events/details/' +
                c.tournament.tournament_id
              "
              target="_blank"
              icon="mdi-open-in-new"
              flat
              dense
              round
              :disable="c.tournament.tournament_id.startsWith('-')"
            >
            </q-btn>
            <q-tooltip v-if="c.tournament.tournament_id.startsWith('-')">
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
import { TournamentLadderEntry, Competition } from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { computed } from 'vue';
import CountryFlag from 'vue-country-flag-next';

const data = useData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  fencerId: string;
  tournaments: TournamentLadderEntry[];
}>();

const competitions = computed<
  {
    competition: Competition;
    tournament: TournamentLadderEntry;
  }[]
>(() => {
  return props.tournaments.flatMap((t) => {
    if (data.tournaments === undefined) {
      return [];
    }
    return [
      {
        competition:
          data.tournaments[t.tournament_id].competitions[t.competition_idx],
        tournament: t,
      },
    ];
  });
});
</script>
