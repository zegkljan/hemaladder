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
              options-dense
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
        <q-separator />

        <q-item-label header>{{ $t('seasonTitle') }}</q-item-label>
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

        <q-item-label header> {{ $t('divisionTitle') }} </q-item-label>
        <q-item v-if="season === null">
          {{ $t('chooseSeason') }}
        </q-item>
        <q-item
          v-else
          v-for="d in divisions"
          :key="d.division"
          :to="routeLink(null, d.division, null)"
          :disable="!d.hasData"
          :active="d.division === division"
        >
          <q-tooltip v-if="!d.hasData">{{ $t('divisionNoData') }}</q-tooltip>
          <q-item-section>
            <q-item-label>{{ $t('division.' + d.division) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item-label header> {{ $t('categoryTitle') }} </q-item-label>
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
    </q-drawer>

    <q-page-container>
      <suspense :timeout="0">
        <router-view />
        <template #fallback>
          <q-page class="row items-top justify-evenly"> Loading... </q-page>
        </template>
      </suspense>
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

const leftDrawerOpen = ref(false);

const { locale } = useI18n({ useScope: 'global' });
const localeOptions = [
  { value: 'cs-CZ', label: 'Čeština' },
  { value: 'en-US', label: 'English' },
];

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
  { division: Division; hasData: boolean }[] | undefined
> = computed((): { division: Division; hasData: boolean }[] | undefined => {
  if (!!data.tournaments) {
    const tours = Object.values(data.tournaments);
    const divs = new Set<Division>();
    tours
      .flatMap((t) => Object.keys(t.competitions))
      .forEach((k) => {
        const div = divisionReverseMap[k as keyof typeof divisionReverseMap];
        divs.add(div);
      });
    const res = Object.keys(divisionReverseMap)
      .map((d) => {
        const div = divisionReverseMap[d as keyof typeof divisionReverseMap];
        return {
          division: div,
          hasData: divs.has(div),
        };
      })
      .sort();
    return res;
  } else {
    return undefined;
  }
});

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
      .flatMap((t) => Object.keys(t.competitions[division.value] ?? {}))
      .forEach((k) => {
        const cat = categoryReverseMap[k as keyof typeof categoryReverseMap];
        cats.add(cat);
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

  return `/${s}/${d}/${c}`;
}

function routeMatches(
  season: Season | null,
  division: Division | null,
  category: Category | null
): boolean {
  const s = route.params.season;
  const d = route.params.division;
  const c = route.params.category;

  return (
    (season === null || season.folder === s) &&
    (division === null || division === d) &&
    (category === null || category === c)
  );
}
</script>
