// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import AppLayout from '@/layout/AppLayout.vue';
import router from './router';
import { store } from './store';
import { installNProgress } from '@/vue-install/lite-nprogress';
import { registerAsyncDataHook } from '@/vue-install/lite-vue-class-component';
import { installElementUI } from '@/vue-install/lite-element-ui';
import '@/styles/import-style';

Vue.use(installElementUI, { size: 'small'});
Vue.use(installNProgress);
Vue.use(registerAsyncDataHook);
Vue.config.productionTip = false;

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(AppLayout)
});

export { app, router, store };