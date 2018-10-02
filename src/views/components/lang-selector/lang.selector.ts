declare const window: Window;

export default {
  name: 'lang-selector',
  methods: {
    scroll() {
      if (window) {
        window.scrollTo(0, 0);
      }
    }
  }
};
