import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
  name: 'site-nav',
  components: {}
})
export default class SiteNav extends Vue {

  mouted() {
    const $nav = document.getElementById('site-nav') as HTMLElement;
    $nav.style.top = '0px';
    console.log('>>>>>');
  }
}