import { Store } from 'pinia';
import { Season } from 'src/logic/ladder';
import { RouteRecordRaw } from 'vue-router';

function buildRoutes(
  data: Store<
    'data',
    {
      seasons: Season[];
    }
  >
): RouteRecordRaw[] {
  return [
    {
      path: '/',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          redirect: () => {
            return `/${data.seasons[0].folder}/ls/mo`;
          },
        },
        {
          path: '/:season/:division/:category',
          component: () => import('pages/LadderPage.vue'),
          props: true,
        },
      ],
    },

    // Always leave this as last one,
    // but you can also remove it
    {
      path: '/:catchAll(.*)*',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ];
}

export default buildRoutes;
