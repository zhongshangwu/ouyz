import Vue from 'vue';
import Component from 'vue-class-component';
import { Post } from '@/models/posts.class';

import PlainContent from '@/views/components/plain-content/PlainContent.vue';

@Component({
  name: 'post-card',
  components: { PlainContent },
  props: {
    post: {
      required: true,
      type: Post
    }
  }
})
export default class PostCard extends Vue{
  post!: Post;

  get lastCategory() {
    return {
      name: 'category'
    };
  }

  get fixedExcerpt() {
    return this.post.excerpt || '占位摘要';
  }

  get commentCount() {
    return 3;
  }

  get hasBanner(): boolean {
    return Boolean(this.post.banner && this.post.banner.length);
  }
}