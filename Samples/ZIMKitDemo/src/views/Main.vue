<template>
  <div class="main">
    <Common></Common>
    <!-- <Conversation></Conversation> -->
    <!-- <Message></Message> -->
    <!-- <Group :show="showGroupUI"></Group> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Common from '../ZIMKit/src/components/ZIMKitCommon/UI/Common.vue';
import Conversation from '../ZIMKit/src/components/ZIMKitConversation/UI/ZIMKitConversationUI.vue';
import Message from '../ZIMKit/src/components/ZIMKitChat/UI/ZIMKitChatUI.vue';
import Group from '../ZIMKit/src/components/ZIMKitGroup/UI/ZIMKitGroupUI.vue';
import ZIMKitManager from '../ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager';
import { clearCacheUserInfo } from '../util';
import ZIMKitChatListVM from '../ZIMKit/src/components/ZIMKitChat/VM/ZIMKitChatListVM';
import bus from '../ZIMKit/src/components/ZIMKitCommon/ToolUtil/bus';
import { ZIMKitConversationType } from '../ZIMKit/src/components/ZIMAdapter/index.entity';
@Component({
  components: {
    Common,
    Conversation,
    Message,
    Group,
  },
})
export default class Main extends Vue {
  showGroupUI = false;
  beforeMount() {
    ZIMKitManager.getInstance().on('connectionStateChanged', this.onConnectionStateChange());
    ZIMKitManager.getInstance().on('loggedStateChanged', this.onLogout());
  }
  mounted() {
    bus.on('groupUIOperation', (type: any) => {
      type ? (this.showGroupUI = false) : (this.showGroupUI = !this.showGroupUI);
    });
  }
  createGroupChat(groupName: string, userIDList: string[]) {
    ZIMKitManager.getInstance()
      .createGroup(groupName, userIDList)
      .then((data) => {
        console.log('===data', data);
        const { groupInfo, errorUserList } = data;
        const { baseInfo } = groupInfo;
        if (errorUserList.length) {
          // 群成员中有不存在的用户，可以根据业务逻辑处理，如弹窗提示等
        } else {
          // 创建群聊成功，直接进入群聊天页面
          const groupID = baseInfo.groupID;
          ZIMKitChatListVM.getInstance().initWithConversationID(groupID, ZIMKitConversationType.ZIMKitConversationTypeGroup);
        }
      })
      .catch(() => {
        // 创建群聊失败，可根据 error 进行提示
      });
  }
  joinGroup(groupID: string) {
    ZIMKitManager.getInstance()
      .joinGroup(groupID)
      .then((data) => {
        const groupID = data.groupInfo.baseInfo.groupID;
        const groupName = data.groupInfo.baseInfo.groupName;
        ZIMKitChatListVM.getInstance().initWithConversationID(groupID, ZIMKitConversationType.ZIMKitConversationTypeGroup, groupName);
      });
  }
  showPeerChat() {
    const conversationID = 'aaavue';
    ZIMKitChatListVM.getInstance().initWithConversationID(conversationID, ZIMKitConversationType.ZIMKitConversationTypePeer);
  }
  showGroup() {
    const conversationID = '';
    ZIMKitChatListVM.getInstance().initWithConversationID(conversationID, ZIMKitConversationType.ZIMKitConversationTypeGroup);
  }
  beforeDestroy() {
    ZIMKitManager.getInstance().off('connectionStateChanged', this.onConnectionStateChange());
    ZIMKitManager.getInstance().off('loggedStateChanged', this.onLogout());
  }
  onConnectionStateChange() {
    return (data: any) => {
      if ((data.state === 0 && data.event === 4) || (data.state === 0 && data.event === 0)) {
        this.$router.push({ name: 'Login' });
        clearCacheUserInfo();
      }
    };
  }
  onLogout() {
    return (state: number) => {
      if (!state) {
        this.$router.push({ name: 'Login' });
        clearCacheUserInfo();
      }
    };
  }
}
</script>
<style scoped>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 770px;
}
</style>
