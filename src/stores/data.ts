import { defineStore } from 'pinia';
import {
  People,
  Tournaments,
  Clubs,
  Ladders,
  Season,
  loadTournaments,
  loadLadders,
} from 'src/logic/ladder';

export const useData = defineStore('data', {
  state: () => ({
    people: {} as People,
    clubs: {} as Clubs,
    seasons: [] as Season[],
    tournaments: {} as Tournaments | undefined,
    ladders: {} as Ladders | undefined,
  }),

  getters: {},

  actions: {
    async loadSeason(season: string) {
      console.debug('Loading season', season);
      this.tournaments = undefined;
      this.ladders = undefined;
      this.tournaments = await loadTournaments(season);
      this.ladders = await loadLadders(season);
    },
  },
});
