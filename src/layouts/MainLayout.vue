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

        <q-toolbar-title> {{ $t('appName') }} </q-toolbar-title>
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
        <q-item-label header> {{ $t('settings') }} </q-item-label>
        <q-separator />

        <q-item-label header caption>{{ $t('seasonTitle') }}</q-item-label>
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

        <q-item-label header caption> {{ $t('divisionTitle') }} </q-item-label>
        <q-item v-if="season === null">
          {{ $t('chooseSeason') }}
        </q-item>
        <q-item
          v-else
          v-for="d in divisions"
          :key="d"
          :to="routeLink(null, d, null)"
        >
          <q-item-section>
            <q-item-label>{{ $t('division.' + d) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item-label header caption> {{ $t('categoryTitle') }} </q-item-label>
        <q-item
          v-for="c in getEnumValues(Category)"
          :key="c"
          :to="routeLink(null, null, c)"
        >
          <q-item-section>
            <q-item-label>{{ $t('category.' + c) }}</q-item-label>
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
  Division,
  divisionReverseMap,
  Season,
} from 'src/logic/ladder';
import { getEnumValues } from 'src/logic/utils';
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
  router.replace(routeLink(val, null, null));
}

const divisions: ComputedRef<Division[] | undefined> = computed(
  (): Division[] | undefined => {
    if (!!data.tournaments) {
      const tours = Object.values(data.tournaments);
      const divs = new Set<Division>();
      tours
        .flatMap((t) => Object.keys(t.competitions))
        .forEach((k) => {
          const div = divisionReverseMap[k as keyof typeof divisionReverseMap];
          divs.add(div);
        });
      const res = Array.from(divs);
      res.sort();
      return res;
    } else {
      return undefined;
    }
  }
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
</script>
