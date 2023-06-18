import { Store } from 'pinia';
import {
  Category,
  Division,
  Season,
  categoryReverseMap,
  divisionReverseMap,
} from 'src/logic/ladder';
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

function passProps(route: RouteLocationNormalized): {
  season: string;
  division: Division;
  category: Category;
} {
  return {
    season: route.params.season as string,
    division:
      divisionReverseMap[
        route.params.division as keyof typeof divisionReverseMap
      ],
    category:
      categoryReverseMap[
        route.params.category as keyof typeof categoryReverseMap
      ],
  };
}

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
            return `/${data.seasons[0].folder}/ls/mo/ladder`;
          },
        },
        {
          path: ':season/:division/:category',
          component: () => import('pages/LadderPage.vue'),
          children: [
            {
              path: ':view(ladder)',
              component: () => import('components/LadderView.vue'),
              props: passProps,
            },
            {
              path: ':view(clubs)',
              component: () => import('components/ClubsView.vue'),
              props: passProps,
            },
            {
              path: ':view(tournaments)',
              component: () => import('components/TournamentsView.vue'),
              props: passProps,
            },
          ],
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
