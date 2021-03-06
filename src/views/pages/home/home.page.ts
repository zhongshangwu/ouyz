import Vue from 'vue';
import Component from 'vue-class-component';

import { Context } from '@/interfaces/fetch.interface';
import { Fetch_Home_Posts_List } from '@/store/types';

import { Post } from '@/models/posts.class';
import { RootState } from '@/store';

import PostCard from '@/views/components/post-card/PostCard.vue';


@Component({
  name: 'home-page',
  components: { PostCard },
})
export default class HomePage extends Vue {

  get posts(): Post[] {
    return (this.$store.state as RootState).home.postList.data;
  }

  get page(): number {
    return (this.$store.state as RootState).home.page;
  }

  get offsetheight() {
    if (document.documentElement) {
      return document.documentElement.clientHeight * 0.382;
    }
    return 600;
  }

  get pagination() {
    const { pageCount, pageSize, total } = (this.$store.state as RootState).home.postList;
    return { pageCount, pageSize, total };
  }

  get msg() {
    return 'this is hello world';
  }

  async onPageChange(page: number) {
    if (this.page === page) {
      return;
    }
    this.$nprogress.start();
    await this.$store.dispatch(`home/${Fetch_Home_Posts_List}`, { page });
    const homePage = document.getElementById('home-page');
    if (homePage) {
      homePage.scrollTop = 0;
    }
    this.$nprogress.done();
  }

  async fetch({ store }: Context) {
    console.log('Fetch posts....');
    const prePage: number = (store.state as RootState).home.page;
    // avoid double fetch initial data
    if (prePage !== 1) {
      await store.dispatch(`home/${Fetch_Home_Posts_List}`, { page: 1 });
    }
  }

  async initData({ store }: Context) {
    console.log('Initition posts....');
    const prePage: number = (store.state as RootState).home.page;
    // avoid double fetch initial data
    if (prePage !== 1) {
      await store.dispatch(`home/${Fetch_Home_Posts_List}`, { page: 1 });
    }
  }
}

