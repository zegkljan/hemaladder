import { boot } from 'quasar/wrappers';
import { createHead } from '@unhead/vue';

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(({ app }) => {
  const head = createHead();
  app.use(head);
});
