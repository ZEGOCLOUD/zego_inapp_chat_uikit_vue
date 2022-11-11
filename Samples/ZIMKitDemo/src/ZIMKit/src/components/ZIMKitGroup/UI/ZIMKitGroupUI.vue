<template>
  <div class="group-container" v-if="show">
    <div class="form-box">
      <div class="id">
        <div class="label">{{ $t('group_group_id') }}</div>
        <div class="value">{{ group && group.baseInfo ? group.baseInfo.groupID : '' }}</div>
      </div>
      <div class="btn copy-btn" @click="copy">{{ $t('group_copy') }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import ZIMKitGroupListVM from '../VM/ZIMKitGroupListVM';
import ZIMKitGroupVM from '../VM/ZIMKitGroupVM';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitConversationVM from '../../ZIMKitConversation/VM/ZIMKitConversationVM';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import { toastOperation } from '../../ZIMKitCommon/ToolUtil/toast';
import '../../ZIMKitCommon/UI/assets/css/common.less';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
@Component({})
export default class Group extends Vue {
  @Prop(Boolean) show!: boolean;
  groupListVM = ZIMKitGroupListVM.getInstance();
  group!: ZIMKitGroupVM;
  mounted() {
    ZIMKitGroupListVM.getInstance().registerLoginStateChangedCallback(async (state: number) => {
      state && ZIMKitGroupListVM.getInstance().queryGroupList();
    });
    if (ZIMKitManager.getInstance().isLoggedIn) {
      ZIMKitGroupListVM.getInstance().queryGroupList();
    }
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentConversationChanged, [
      async (conversation: ZIMKitConversationVM) => {
        if (conversation.type === 2) {
          const group = this.groupListVM.groupList.get(conversation.conversationID) as ZIMKitGroupVM;
          // if (group) {
          //   this.group = group;
          // } else {
          // ZIMKitGroupListVM.getInstance()
          //   .queryGroupList()
          //   .then(() => {
          //     this.group = this.groupListVM.groupList.get(conversation.conversationID) as ZIMKitGroupVM;
          //     console.log('===query', this.groupListVM, this.group);
          //   });
          // }
          if (!group) {
            this.groupListVM.groupList.set(conversation.conversationID, new ZIMKitGroupVM({ baseInfo: { groupID: conversation.conversationID, groupName: conversation.conversationName } }));
          }
          this.group = this.groupListVM.groupList.get(conversation.conversationID) as ZIMKitGroupVM;
        }
      },
    ]);
  }
  copy() {
    navigator.clipboard.writeText(this.group.baseInfo.groupID);
    toastOperation(true, {
      duration: true,
      text: `${this.$t('group_copy_success')}`,
      type: 'default',
    });
  }
}
</script>
<style lang="less" scoped>
.group-container {
  padding: 40px 32px 65px;
  width: 272px;
  height: 664px;
  background-color: #fff;
  border-radius: 0 0 8px 0;
  .form-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    .id {
      .label {
        text-align: left;
        font-size: 14px;
        font-weight: 500;
        color: #394256;
        line-height: 20px;
      }
      .value {
        text-align: left;
        padding-left: 12px;
        width: 208px;
        height: 44px;
        background-color: #f4f5f8;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 400;
        color: #18191a;
        line-height: 44px;
      }
    }
    .copy-btn {
      width: 208px;
      height: 44px;
      line-height: 44px;
    }
  }
}
</style>
