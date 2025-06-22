import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/loginPage.vue'),
    },
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('@/views/layout/LayoutPage.vue'),
      redirect: '/layout/Bubbles',
      children: [
        {
          path: 'Bubbles',
          name: 'Bubbles',
          component: () => import('@/views/Bubbles/BubblesPages.vue'),
        },
        {
          path: 'Tree',
          name: 'Tree',
          component: () => import('@/views/Tree/TreePages.vue'),
        },
        {
          path: 'TowerofHanoi',
          name: 'TowerofHanoi',
          component: () => import('@/views/TowerofHanoi/TowerofHanoi.vue'),
        },
        {
          path: 'Chess',
          name: 'Chess',
          component: () => import('@/views/Chess/ChessPages.vue'),
        },
      ],
    },
  ],
})

export default router
