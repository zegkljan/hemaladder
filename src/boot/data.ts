import { boot } from 'quasar/wrappers';
import { loadClubs, loadPeople, loadTournaments } from 'src/logic/ladder';
import { useData } from 'src/stores/data';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ store /* app, router, ... */ }) => {
  const dataStore = useData(store);
  dataStore.clubs = await loadClubs();
  dataStore.people = await loadPeople();
  dataStore.tournaments = await loadTournaments();
});
