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
      redirect: '/login', // 将根路径重定向到登录页
    },
    {
      path: '/layout',
      name: 'layout',
      component: () => import('@/views/layout/LayoutPage.vue'),
      redirect: '/layout/user',
      children: [
        {
          path: 'user', // 修正路径为相对路径
          name: 'user',
          component: () => import('@/views/user/UserPages.vue'),
        },
      ],
    },
  ],
})

export default router
