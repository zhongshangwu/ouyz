import Vue from 'vue';
import LangSelector from '@/views/components/lang-selector/LangSelector.vue';
import SiteNav from '@/views/components/site-nav/SiteNav.vue';
import Component from 'vue-class-component';

@Component({
  name: 'home-page',
  components: { SiteNav }
})
export default class HomePage extends Vue {

  get offsetheight() {
    if (document.documentElement) {
      return document.documentElement.clientHeight;
    }
    return 600;
  }

  get msg() {
    return 'this is hello world';
  }
}

