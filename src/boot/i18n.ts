import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';
import { config } from 'src/build/resources/brand/config';

import messages from 'src/i18n';

export default boot(({ app }) => {
  const i18n = createI18n({
    locale: config.defaultLocale,
    messages,
    globalInjection: true,
  });

  // Set i18n instance on app
  app.use(i18n);
});
