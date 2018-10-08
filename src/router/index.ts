import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'hello-world',
      component: () => import('@/components/HelloWorld.vue')
    },
    {
      path: '/home',
      name: 'home-page',
      component: () => import('@/views/pages/home/HomePage.vue')
    },
    {
      path: '/posts/:abbrlink',
      name: 'post-page',
      component: () => import('@/views/pages/posts/PostPage.vue')
    }
  ]
});
