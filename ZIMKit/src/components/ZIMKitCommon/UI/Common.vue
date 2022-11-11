<template>
  <div id="zegoim">
    <div class="zego-im-container">
      <div class="top-banner">
        <div class="logo" @click="uploadLog">{{ lang.includes('en') ? '' : 'ZEGO' }} In-app Chat {{ connectionStateObj[connectionState] }}</div>
      </div>
      <div class="box">
        <Conversation></Conversation>
        <Message></Message>
        <div class="group-wrap">
          <Group :show="showGroupUI"></Group>
        </div>
      </div>
      <toast :showToast.sync="showToast" :toastData="toastData"></toast>
      <BaseDialog v-show="showBaseDialog" :dialogData="dialogData" :show.sync="showBaseDialog"></BaseDialog>
      <RightClickDialog v-if="showRightClickMenu" :rightClickData="rightClickData"></RightClickDialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import '../UI/assets/css/common.less';
import Toast from './components/Toast.vue';
import BaseDialog from '../../ZIMKitCommon/UI/components/dialog.vue';
import bus from '../ToolUtil/bus';
import Conversation from '../../ZIMKitConversation/UI/ZIMKitConversationUI.vue';
import Message from '../../ZIMKitChat/UI/ZIMKitChatUI.vue';
import Group from '../../ZIMKitGroup/UI/ZIMKitGroupUI.vue';
import { groupUIOperation, toastOperation } from '../../ZIMKitCommon/ToolUtil/toast';
import RightClickDialog from '../../ZIMKitCommon/UI/components/right-click-dialog.vue';
import ZIMKitManager from '../VM/ZIMKitManager';
import ZIMKitEventHandler from '../VM/ZIMKitEventHandler';
import { EventName } from '../Constant/event';
@Component({
  components: {
    Toast,
    BaseDialog,
    Conversation,
    Message,
    Group,
    RightClickDialog,
  },
})
export default class Common extends Vue {
  toastData = {
    text: '',
    type: 'default',
  };
  showToast = false;
  dialogData = {
    title: '',
    desc: '',
    cancelText: '',
    confirmText: '',
    hasCloseBtn: false,
  };
  showBaseDialog = false;
  showGroupUI = false;
  showRightClickMenu = false;
  rightClickData = {};
  lang = navigator.language;
  lastClickTime = 0;
  num = 0;
  connectionState = 2;
  connectionStateObj = {
    0: `(${this.$t('conversation_disconnected')})`,
    1: `(${this.$t('conversation_connecting')})`,
    3: `(${this.$t('conversation_connecting')})`,
  };
  mounted() {
    window.addEventListener('click', this.handleClick);
    bus.on('toastOperation', (type, toastData) => {
      this.toastData = toastData;
      this.showToast = type;
    });
    bus.on('dialogOperation', (type, dialogData) => {
      this.dialogData = dialogData;
      this.showBaseDialog = type;
    });
    bus.on('groupUIOperation', (type) => {
      type ? (this.showGroupUI = false) : (this.showGroupUI = !this.showGroupUI);
    });
    bus.on('rightClickDialogOperation', (type, data) => {
      this.showRightClickMenu = type;
      this.rightClickData = data;
    });
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimConnectionStateChanged, [
      (data) => {
        this.connectionState = data.state;
      },
    ]);
  }
  beforeDestroy() {
    window.removeEventListener('click', this.handleClick);
  }
  handleClick(event: MouseEvent) {
    const path = (event as any).path || (event.composedPath && event.composedPath());
    if (!(event as any).target.parentNode?.className.includes('right-click-box') && !(event as any).target.parentNode?.parentNode?.className.includes('right-click-box')) {
      const box = document.querySelector('.right-click-box');
      let flag = false;
      path.forEach((item: HTMLElement) => {
        if (item === box) {
          flag = true;
        }
      });
      if (box && !flag) {
        this.showRightClickMenu = !this.showRightClickMenu;
        if (!this.showRightClickMenu) {
          const msgBox = document.querySelector('.message-content') as HTMLDivElement;
          msgBox.style.overflowY = 'scroll';
          const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
          conversationBox.style.overflowY = 'auto';
        }
      }
    } else {
      this.showRightClickMenu = !this.showRightClickMenu;
      if (!this.showRightClickMenu) {
        const msgBox = document.querySelector('.message-content') as HTMLDivElement;
        msgBox.style.overflowY = 'scroll';
        const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
        conversationBox.style.overflowY = 'auto';
      }
    }
  }
  uploadLog() {
    const clickTime = new Date().getTime();
    if (!this.lastClickTime || clickTime - this.lastClickTime < 500) {
      this.num++;
    } else {
      this.num = 0;
    }
    this.lastClickTime = clickTime;
    if (this.num === 4) {
      this.num = 0;
      ZIMKitManager.getInstance()
        .uploadLog()
        .then(() => {
          toastOperation(true, {
            duration: true,
            text: '上传日志成功',
            type: 'default',
          });
        })
        .catch((err) => {
          toastOperation(true, {
            duration: true,
            text: `上传日志失败：${err}`,
            type: 'default',
          });
        });
    }
  }
}
</script>
<style lang="less">
* {
  margin: 0;
  font-family: PingFangSC-Medium, PingFang SC;
  box-sizing: border-box;
}
</style>
<style lang="less" scoped>
#zegoim {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
}
.zego-im-container {
  display: flex;
  flex-direction: column;
  width: 1030px;
  height: 770px;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  .top-banner {
    display: flex;
    padding-left: 24px;
    text-align: left;
    font-size: 16px;
    font-weight: 500;
    line-height: 50px;
    color: #fff;
    width: 100%;
    height: 50px;
    background-color: #3478fc;
    border-radius: 8px 8px 0 0;
  }
  .box {
    position: relative;
    display: flex;
    width: 100%;
    height: 720px;
  }
  .group-wrap {
    z-index: 5;
    position: absolute;
    right: 0;
    bottom: 0;
  }
}
</style>
