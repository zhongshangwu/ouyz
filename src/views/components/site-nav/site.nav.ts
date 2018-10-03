import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  name: 'site-nav',
  components: {},
  props: {
    threshold: {
      type: Number,
      default: 0,
      required: false
    }
  },
})
export default class SiteNav extends Vue {

  threshold!: number;
  fixTop: number = -100;

  created() {
    console.log(window);
    window.addEventListener('scroll', this.handleScroll, true);

  }

  beforeDestory() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll(event: Event) {
    const $tag = document.getElementById('home-page') as HTMLElement;
    if ($tag.scrollTop > this.threshold) {
      this.fixTop = 0;
    } else {
      this.fixTop = -100;
    }
  }

  get theme() {
    return {
      avatar: 'http://shawnz.me/images/avatar.jpg',
    };
  }
}
