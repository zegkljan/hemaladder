import { defineStore } from 'pinia';
import { People, Tournaments, Clubs } from 'src/logic/ladder';

export const useData = defineStore('data', {
  state: () => ({
    people: {} as People,
    clubs: {} as Clubs,
    tournaments: {} as Tournaments,
  }),

  getters: {},

  actions: {},
});
