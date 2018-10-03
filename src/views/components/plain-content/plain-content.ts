import Vue from 'vue';

export default Vue.extend({
  name: 'plain-content',
  props: {
    html: {
      required: true,
      type: String
    }
  }
});
