import { boot } from 'quasar/wrappers';
import { loadClubs, loadPeople, loadSeasons } from 'src/logic/ladder';
import { useData } from 'src/stores/data';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ store /* app, router, ... */ }) => {
  const data = useData(store);
  data.clubs = await loadClubs();
  data.people = await loadPeople();
  data.seasons = await loadSeasons();
});
