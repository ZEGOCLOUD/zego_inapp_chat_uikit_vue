<template>
  <transition name="fade" v-if="showToast && toastData.text">
    <div class="default" :class="{ loading: toastData.type === 'loading' }">
      <div class="toast" :class="{ error: toastData.type === 'error' }">
        <div class="text">{{ toastData.text }}</div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({})
export default class Toast extends Vue {
  @Prop(Object) toastData: any;
  @Prop(Boolean) showToast!: boolean;
  duration = 2000;
  beforeUpdate() {
    if (this.showToast) {
      clearTimeout();
      setTimeout(() => {
        this.$emit('update:showToast', false);
      }, this.duration);
    }
  }
}
</script>
<style lang="less" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.default {
  position: fixed;
  z-index: 103; /* 比弹窗dialog层级高 */
  .toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 15px;
    text-align: center;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.6);
    opacity: 0.96;
    display: flex;
    &.error {
      background-color: #fff;
    }
    .name {
      display: inline-block;
    }
    .text {
      display: inline-block;
    }
  }
  &.loading {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.6);
    .toast {
      top: 50%;
      transform: translate(-50%, -50%);
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.6);
      height: 40px;
      line-height: 40px;
    }
  }
}
</style>
