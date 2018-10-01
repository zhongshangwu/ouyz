// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { store } from './store';
import {} from '@/vue-install/lite-nprogress';
import { installNProgress } from '@/vue-install/lite-nprogress';


Vue.use(installNProgress);
Vue.config.productionTip = false;

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

export { app, router, store };