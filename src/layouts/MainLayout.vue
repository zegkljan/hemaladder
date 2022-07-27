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
            @update:model-value="onSeasonChange"
            :options="data.seasons"
            option-value="folder"
            option-label="name"
            style="width: 100%"
            borderless
          ></q-select>
        </q-item>
        <q-separator />

        <q-item-label header caption> {{ $t('divisionTitle') }} </q-item-label>
        <q-item
          v-for="d in getEnumValues(Division).filter((d) => d == Division.LS)"
          :key="d"
          :to="routeLink({ what: 'division', target: d })"
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
          :to="routeLink({ what: 'category', target: c })"
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
import { ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { getEnumValues } from 'src/logic/utils';
import { useRoute, useRouter } from 'vue-router';
import { Season, Category, Division } from 'src/logic/ladder';
import { useData } from 'src/stores/data';
import { computed } from '@vue/reactivity';

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

const season: ComputedRef<Season | undefined> = computed(
  (): Season | undefined => {
    const rawSeason = router.currentRoute.value.params['season'];
    const s = data.seasons.find((s) => s.folder === rawSeason);
    return s;
  }
);

function onSeasonChange(val: Season) {
  router.push(routeLink({ what: 'season', target: val }));
}

function routeLink(
  options:
    | { what: 'season'; target: Season }
    | { what: 'division'; target: Division }
    | { what: 'category'; target: Category }
): string {
  const season = route.params.season;
  const division = route.params.division;
  const category = route.params.category;

  switch (options.what) {
    case 'season':
      return `/${options.target.folder}/${division}/${category}`;
    case 'division':
      return `/${season}/${options.target}/${category}`;
    case 'category':
      return `/${season}/${division}/${options.target}`;
  }
}
</script>
