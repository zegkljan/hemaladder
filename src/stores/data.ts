import { defineStore } from 'pinia';
import {
  People,
  Tournaments,
  Clubs,
  LaddersIndividual,
  Season,
  loadTournaments,
  loadLaddersIndividual,
  LaddersClub,
  loadLaddersClub,
} from 'src/logic/ladder';

export const useData = defineStore('data', {
  state: () => ({
    people: {} as People,
    clubs: {} as Clubs,
    seasons: [] as Season[],
    tournaments: {} as Tournaments | undefined,
    laddersIndividual: {} as LaddersIndividual | undefined,
    laddersClub: {} as LaddersClub | undefined,
  }),

  getters: {},

  actions: {
    async loadSeason(season: string) {
      console.debug('Loading season', season);
      this.tournaments = undefined;
      this.laddersIndividual = undefined;
      this.laddersClub = undefined;
      this.tournaments = await loadTournaments(season);
      this.laddersIndividual = await loadLaddersIndividual(season);
      this.laddersClub = await loadLaddersClub(season);
    },
  },
});
