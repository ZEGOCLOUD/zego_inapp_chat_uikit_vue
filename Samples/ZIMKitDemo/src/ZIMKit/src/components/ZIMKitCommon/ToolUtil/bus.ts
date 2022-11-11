import Vue from 'vue';

export default new Vue({
  methods: {
    on(event: string, callback: (...args: any[]) => void): Vue {
      this.$on(event, callback);
      return this;
    },

    once(event: string, callback: (...args: any[]) => void): Vue {
      this.$once(event, callback);
      return this;
    },

    off(event: string, callback: (...args: any[]) => void): Vue {
      this.$off(event, callback);
      return this;
    },

    emit(event: string, ...args: any[]): Vue {
      this.$emit(event, ...args);
      return this;
    },
  },
});
