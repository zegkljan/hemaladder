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

        <q-item-label header caption>{{
          $t('fencerCountryTitle')
        }}</q-item-label>
        <q-item
          v-for="c in getEnumValues(FencerNationality)"
          :key="c"
          :to="routeLink({ what: 'fencers', target: c })"
        >
          <q-item-section>
            <q-item-label>{{ $t('fencerCountry.' + c) }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator />

        <q-item-label header caption>{{
          $t('tournamentsCountryTitle')
        }}</q-item-label>
        <q-item
          v-for="c in getEnumValues(TournamentsCountry)"
          :key="c"
          :to="routeLink({ what: 'tournaments', target: c })"
        >
          <q-item-section>
            <q-item-label>{{ $t('tournamentsCountry.' + c) }}</q-item-label>
          </q-item-section>
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getEnumValues } from 'src/logic/utils';
import { useRoute } from 'vue-router';
import {
  Category,
  FencerNationality,
  TournamentsCountry,
  Division,
} from 'src/logic/ladder';

const leftDrawerOpen = ref(false);

const { locale } = useI18n({ useScope: 'global' });
const localeOptions = [
  { value: 'cs-CZ', label: 'Čeština' },
  { value: 'en-US', label: 'English' },
];

const route = useRoute();
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
function routeLink(
  options:
    | { what: 'fencers'; target: FencerNationality }
    | { what: 'tournaments'; target: TournamentsCountry }
    | { what: 'division'; target: Division }
    | { what: 'category'; target: Category }
): string {
  const fencers = route.params.fencerCountry;
  const tournaments = route.params.tournamentsCountry;
  const division = route.params.division;
  const category = route.params.category;

  switch (options.what) {
    case 'fencers':
      return `/${options.target}/${tournaments}/${division}/${category}`;
    case 'tournaments':
      return `/${fencers}/${options.target}/${division}/${category}`;
    case 'division':
      return `/${fencers}/${tournaments}/${options.target}/${category}`;
    case 'category':
      return `/${fencers}/${tournaments}/${division}/${options.target}`;
  }
}
</script>
