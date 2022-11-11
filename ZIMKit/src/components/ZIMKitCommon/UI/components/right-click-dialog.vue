<template>
  <div class="right-click-box" :style="`top: ${rightClickData && rightClickData.y}px;left: ${rightClickData && rightClickData.x}px`">
    <div v-if="rightClickData && rightClickData.conversationItem" class="item" @click="closeConversation">{{ $t('conversation_close_chat_w') }}</div>
    <div v-if="rightClickData && rightClickData.messageItem">
      <div v-if="rightClickData.messageItem.mMessage.fileDownloadUrl && (rightClickData.messageItem.mMessage.type === 11 || rightClickData.messageItem.mMessage.type === 12 || rightClickData.messageItem.mMessage.type === 14)" class="item" @click="downLoad">{{ $t('album_download_image_w') }}</div>
      <div class="item" @click="deleteMsg">{{ $t('conversation_delete') }}</div>
      <div class="item" @click="multiSelect">{{ $t('message_multi_select') }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import ZIMKitConversationListVM from '../../../ZIMKitConversation/VM/ZIMKitConversationListVM';
import ZIMKitChatListVM from '../../../ZIMKitChat/VM/ZIMKitChatListVM';
import { Mode } from '../../../ZIMKitChat/Constant';
import ZIMKitEventHandler from '../../VM/ZIMKitEventHandler';
import { EventName } from '../../Constant/event';
import { dialogOperation, groupUIOperation, expressionBoxOperation } from '../../ToolUtil/toast';
@Component({})
export default class RightClickDialog extends Vue {
  @Prop(Object) rightClickData!: any;
  mounted() {
    groupUIOperation('close');
    expressionBoxOperation('close');
  }
  closeConversation() {
    ZIMKitConversationListVM.getInstance().deleteConversation(this.rightClickData.conversationItem.conversationID, this.rightClickData.conversationItem.type);
  }
  downLoad() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.rightClickData.messageItem.mMessage.fileDownloadUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = this.rightClickData.messageItem.mMessage.fileName; //文件名
        a.click();
      }
    };
    xhr.send();
  }
  deleteMsg() {
    const message = JSON.parse(JSON.stringify(this.rightClickData.messageItem.mMessage));
    dialogOperation(true, {
      desc: `${this.$t('message_delete_confirmation_desc')}`,
      confirmText: `${this.$t('conversation_delete')}`,
      cancelText: `${this.$t('conversation_cancel')}`,
      hasCloseBtn: false,
      confirmFunc: () => {
        ZIMKitChatListVM.getInstance().currentChat.deleteMessages(message);
      },
    });
  }
  multiSelect() {
    ZIMKitChatListVM.getInstance().mode = Mode['multiSelect'];
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitModeChanged, Mode['multiSelect'], this.rightClickData.messageItem);
  }
}
</script>
<style lang="less" scoped>
.right-click-box {
  z-index: 4;
  position: absolute;
  padding: 8px 0;
  width: 128px;
  background: #ffffff;
  box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.1), 0px 6px 12px 0px rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  .item {
    padding: 8px 0 8px 16px;
    font-size: 14px;
    font-weight: 400;
    color: #28292e;
    &:hover {
      cursor: pointer;
      color: #1169ff;
      background: #fafbfd;
    }
  }
}
</style>
