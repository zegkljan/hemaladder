import { defineStore } from 'pinia';
import { People, Tournaments, Clubs, Ladders, Season } from 'src/logic/ladder';

export const useData = defineStore('data', {
  state: () => ({
    people: {} as People,
    clubs: {} as Clubs,
    seasons: [] as Season[],
    tournaments: {} as Tournaments | undefined,
    ladders: {} as Ladders | undefined,
  }),

  getters: {},

  actions: {},
});
