<template>
  <div class="wrapper">
    <div class="dialog">
      <div v-if="dialogData.hasCloseBtn" class="close-icon" @click="close"></div>
      <div class="title">{{ dialogData.title }}</div>
      <div class="desc">{{ dialogData.desc }}</div>
      <div class="line"></div>
      <div class="btn-box">
        <button class="btn cancel" v-if="dialogData.cancelText" @click="clickBtn('cancel')">{{ dialogData.cancelText }}</button>
        <button class="btn confirm" v-if="dialogData.confirmText" @click="clickBtn('confirm')">{{ dialogData.confirmText }}</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({})
export default class Dialog extends Vue {
  @Prop(String) type!: string;
  @Prop(Object) dialogData: any;
  clickBtn(type: string) {
    if (type === 'confirm') {
      this.dialogData.confirmFunc && this.dialogData.confirmFunc();
    } else if (type === 'cancel') {
      this.dialogData.cancelFunc && this.dialogData.cancelFunc();
    }
    this.$emit('update:show', false);
  }
  close() {
    this.$emit('update:show', false);
  }
}
</script>
<style lang="less" scoped>
.wrapper {
  z-index: 102; /* 比播放遮罩层级高 */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  .dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
    box-sizing: border-box;
    width: 340px;
    min-height: 163px;
    background-color: #fff;
    border-radius: 4px;
    font-size: 16px;
    color: #28292e;
    .close-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      align-self: flex-end;
      width: 30px;
      height: 30px;
      cursor: pointer;
      &::before,
      &::after {
        position: absolute;
        content: ' ';
        height: 12px;
        width: 2px;
        background-color: #fff;
      }
      &::before {
        transform: rotate(45deg);
      }
      &::after {
        transform: rotate(-45deg);
      }
    }
    .title {
      font-size: 16px;
    }
    .desc {
      text-align: center;
      width: 240px;
      word-break: break-word;
      line-height: 21px;
    }
    .line {
      margin: 20px 0;
      width: 292px;
      height: 1px;
      background: #ebecec;
    }
    .btn-box {
      .cancel {
        background-color: #fff;
        color: #3478fc;
        border: 1px solid #e8e8e8;
        width: 100px;
        height: 36px;
      }
      .confirm {
        margin-left: 20px;
        width: 100px;
        height: 36px;
      }
    }
  }
}
</style>
