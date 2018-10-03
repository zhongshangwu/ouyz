import Vue from 'vue';
import Component from 'vue-class-component';

import SiteNav from '@/views/components/site-nav/SiteNav.vue';

@Component({
  name: 'app-layout',
  components: { SiteNav }
})
export default class AppLayout extends Vue {

  beforeMount() {
    document.title = 'Ouyz';
  }

  mounted() {
    const $app = document.getElementById('id') as HTMLElement;

  }

}
