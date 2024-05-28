<template>
  <q-page class="row items-top justify-evenly">
    <q-tabs>
      <q-route-tab
        v-for="v in views"
        :key="v"
        :name="v"
        :label="$t('view.' + v)"
        :to="v"
      />
    </q-tabs>
    <suspense :timeout="0">
      <router-view />
      <template #fallback>
        <q-page class="row items-top justify-evenly"> Loading... </q-page>
      </template>
    </suspense>
  </q-page>
</template>

<style lang="scss"></style>

<script setup lang="ts">
import { View, viewReverseMap } from 'src/logic/ladder';
import { ComputedRef, computed } from 'vue';

const views: ComputedRef<View[]> = computed((): View[] => {
  return Object.values(viewReverseMap);
});
</script>
