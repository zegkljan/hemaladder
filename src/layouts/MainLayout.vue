<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ $t('appName') }} - {{ season?.name }} -
          {{ $t('division.' + division) }} -
          {{ $t('category.' + category) }}</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item>
          <q-item-section>
            <q-select
              v-model="locale"
              :options="localeOptions"
              dense
              borderless
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item href="https://github.com/zegkljan/hemaladder" target="_blank">
          <q-item-section avatar>
            <q-icon name="mdi-github"></q-icon>
          </q-item-section>
          <q-item-section>{{ $t('sourceCode') }}</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-open-in-new"></q-icon>
          </q-item-section>
        </q-item>
        <q-item
          v-if="config.fbLink !== undefined"
          :href="config.fbLink"
          target="_blank"
        >
          <q-item-section avatar>
            <q-icon name="mdi-facebook"></q-icon>
          </q-item-section>
          <q-item-section>{{ $t('ladderOnFacebook') }}</q-item-section>
          <q-item-section side>
            <q-icon name="mdi-open-in-new"></q-icon>
          </q-item-section>
        </q-item>
        <q-item clickable @click="addResultsDialogOpen = true">
          <q-item-section avatar>
            <q-icon name="mdi-file-document-plus"></q-icon>
          </q-item-section>
          <q-item-section>{{ $t('addResults.buttonLabel') }}</q-item-section>
        </q-item>
        <q-separator />

        <q-item dense>
          <q-item-section>
            <q-item-label header>{{ $t('seasonTitle') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-select
            :model-value="season"
            @update:model-value="onSeasonChanged"
            :options="data.seasons"
            option-value="folder"
            option-label="name"
            style="width: 100%"
            borderless
          ></q-select>
        </q-item>
        <q-separator />

        <q-item dense>
          <q-item-section>
            <q-item-label header> {{ $t('divisionTitle') }} </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-caption">
              {{ $t('divisionNoTournaments') }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="season === null">
          {{ $t('chooseSeason') }}
        </q-item>
        <template v-else>
          <template v-for="d in divisions" :key="d.division">
            <q-item
              v-if="d.noTournaments > 0"
              :to="routeLink(null, d.division, null)"
              :disable="d.noTournaments === 0"
              :active="d.division === division"
            >
              <q-tooltip v-if="d.noTournaments === 0">{{
                $t('divisionNoData')
              }}</q-tooltip>
              <q-item-section>
                <q-item-label>{{ $t('division.' + d.division) }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="d.noTournaments > 0">
                <q-item-label>
                  <q-icon
                    v-if="d.noTournaments === 1"
                    name="mdi-alert"
                    color="warning"
                  >
                    <q-tooltip>{{
                      $t('divisionSingleTournamentWarningTooltip')
                    }}</q-tooltip>
                  </q-icon>
                  {{ d.noTournaments }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </template>
        <q-separator />

        <q-item dense>
          <q-item-section>
            <q-item-label header> {{ $t('categoryTitle') }} </q-item-label>
          </q-item-section>
        </q-item>
        <q-item
          v-for="c in categories"
          :key="c.category"
          :to="routeLink(null, null, c.category)"
          :disable="!c.hasData"
          :active="c.category === category"
        >
          <q-tooltip v-if="!c.hasData">{{ $t('categoryNoData') }}</q-tooltip>
          <q-item-section>
            <q-item-label>{{ $t('category.' + c.category) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />
      </q-list>
      <q-dialog v-model="addResultsDialogOpen">
        <q-card class="fit-content">
          <q-card-section>
            <div class="text-h6">{{ $t('addResults.title') }}</div>
          </q-card-section>
          <q-card-section v-html="$t('addResults.main')"> </q-card-section>
          <q-separator inset />
          <q-card-section
            class="footnotes"
            v-html="$t('addResults.footnotes')"
          ></q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('close')" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import {
  Category,
  categoryReverseMap,
  Division,
  divisionReverseMap,
  Season,
} from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { ComputedRef, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { config } from 'src/build/resources/brand/config';
import { useHead } from '@unhead/vue';

const leftDrawerOpen = ref(false);

const { locale } = useI18n({ useScope: 'global' });
const localeOptions = [
  { value: 'cs-CZ', label: 'Čeština', flag: 'cz' },
  { value: 'en-US', label: 'English', flag: 'us' },
].filter((x) => config.enabledLocales.find((l) => l === x.value) !== undefined);

const { t } = useI18n();
useHead({
  title: () => t('appName'),
  meta: () => {
    const descr = t('appDescription');
    if (descr === '') {
      return [];
    }
    return [
      {
        name: 'description',
        content: descr,
      },
    ];
  },
});

let addResultsDialogOpen = ref(false);

const route = useRoute();
const router = useRouter();

const data = useData();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const season: ComputedRef<Season | null> = computed(() => {
  const rawSeason = router.currentRoute.value.params['season'];
  const s = data.seasons.find((s) => s.folder === rawSeason);
  if (!!s) {
    return s;
  }
  return null;
});

function onSeasonChanged(val: Season) {
  router.push(routeLink(val, null, null));
}

const divisions: ComputedRef<
  { division: Division; noTournaments: number }[] | undefined
> = computed(
  (): { division: Division; noTournaments: number }[] | undefined => {
    if (!!data.tournaments) {
      const tours = Object.values(data.tournaments);
      const divs = new Map<Division, number>();
      tours
        .flatMap((t) => t.competitions)
        .forEach((c) => {
          divs.set(c.division, 1 + (divs.get(c.division) ?? 0));
        });
      const res = Object.keys(divisionReverseMap)
        .map((d) => {
          const div = divisionReverseMap[d as keyof typeof divisionReverseMap];
          return {
            division: div,
            noTournaments: divs.get(div) ?? 0,
          };
        })
        .sort((a, b) => {
          if (a.noTournaments === b.noTournaments) {
            return a.division.localeCompare(b.division);
          }
          return b.noTournaments - a.noTournaments;
        });
      return res;
    } else {
      return undefined;
    }
  }
);

const division: ComputedRef<Division> = computed(
  (): Division =>
    divisionReverseMap[route.params.division as keyof typeof divisionReverseMap]
);

const categories: ComputedRef<
  { category: Category; hasData: boolean }[] | undefined
> = computed((): { category: Category; hasData: boolean }[] | undefined => {
  if (!!data.tournaments) {
    const tours = Object.values(data.tournaments);
    const cats = new Set<Category>();
    tours
      .flatMap((t) =>
        t.competitions.filter((c) => c.division === division.value)
      )
      .forEach((c) => {
        cats.add(c.category);
      });
    const res = Object.keys(categoryReverseMap)
      .map((c) => {
        const cat = categoryReverseMap[c as keyof typeof categoryReverseMap];
        return {
          category: cat,
          hasData: cats.has(cat),
        };
      })
      .sort();
    return res;
  } else {
    return undefined;
  }
});

const category: ComputedRef<Category> = computed(
  (): Category =>
    categoryReverseMap[route.params.category as keyof typeof categoryReverseMap]
);

function routeLink(
  season: Season | null,
  division: Division | null,
  category: Category | null
): string {
  const s = season === null ? route.params.season : season.folder;
  const d = division === null ? route.params.division : division;
  const c = category === null ? route.params.category : category;
  const w = route.params.view;
  console.debug(w);

  return `/${s}/${d}/${c}/${w}`;
}
</script>

<style lang="scss">
.fit-content {
  width: fit-content;
  max-width: fit-content !important;
}

.footnotes {
  font-size: smaller;

  ol {
    list-style: none;
    counter-reset: fnc;

    li {
      counter-increment: fnc;

      &::before {
        content: counter(fnc);
        vertical-align: super;
        font-size: smaller;
      }
    }

    li {
      counter-increment: fnc;

      & + li {
        margin-top: 0.4rem;
      }

      &::before {
        content: counter(fnc);
        vertical-align: super;
        font-size: smaller;
        float: left;
        position: relative;
        top: -0.15rem;
        margin-right: 0.1rem;
      }
    }
  }
}
</style>
