<template>
  <div class="conversation">
    <div class="left-banner">
      <div class="top">
        <div class="item">
          <div class="icon message-icon"></div>
          <div class="text">{{ $t('conversation_message_total_count') }}</div>
          <!-- <div class="text">消息总数</div> -->
          <div class="total" v-if="conversation.totalUnreadMessageCount">
            {{ conversation.totalUnreadMessageCount > 99 ? '99+' : conversation.totalUnreadMessageCount }}
          </div>
        </div>
        <div class="item" @click="triggerDialog">
          <div class="icon create-chat-icon"></div>
          <div class="text create-chat-text">{{ $t('conversation_start_chat_w') }}</div>
          <!-- <div class="text create-chat-text">发起聊天</div> -->
        </div>
      </div>
      <div class="item" @click="logout">
        <div class="icon exit-icon"></div>
        <div class="text exit-text">{{ $t('common_logout') }}</div>
        <!-- <div class="text exit-text">退出</div> -->
      </div>
    </div>
    <template v-if="!isAbnormal">
      <div v-if="conversationList.size" class="conversation-content" @scroll="listScroll()">
        <div class="conversation-item" :class="{ actived: conversation.activeConversationID === item.conversationID }" v-for="(item, index) in conversationList.values()" :key="index" @click="switchConversation(item)" @click.right.prevent="operationConversation($event, item)">
          <div class="head-portrait">
            <template v-if="item.type === 0">
              <img :src="item.conversationAvatarUrl ? item.conversationAvatarUrl : require('../../ZIMKitCommon/UI/assets/images/avatar-default.png')" />
            </template>
            <template v-else>
              <div class="group"></div>
            </template>
            <div class="unread-count" v-if="item.unreadMessageCount">
              {{ item.unreadMessageCount > 99 ? '99+' : item.unreadMessageCount }}
            </div>
          </div>
          <div class="conversation-info">
            <div class="info-top">
              <div class="item-name">
                {{ item.conversationName || item.conversationID }}
              </div>
              <div v-if="item.lastMessage" class="item-date">
                {{ dateFormat(item.lastMessage.timestamp) }}
              </div>
            </div>
            <div v-if="item.lastMessage" class="item-message">
              <div v-if="item.lastMessage.sentStatus === 2" class="err-icon"></div>
              <div class="message-text">
                <template v-if="item.lastMessage.type === 1">{{ item.lastMessage.message }}</template>
                <template v-if="item.lastMessage.type === 11">{{ $t('common_message_photo') }}</template>
                <template v-if="item.lastMessage.type === 12">{{ $t('common_message_file') }}</template>
                <template v-if="item.lastMessage.type === 13">{{ $t('common_message_audio') }}</template>
                <template v-if="item.lastMessage.type === 14">{{ $t('common_message_video') }}</template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="default-content">
        <!-- <div class="text">{{ $t('conversation_empty') }}</div> -->
        <div class="text">
          {{ $t('conversation_empty') }}
        </div>
      </div>
    </template>
    <template v-else>
      <div class="abnormal-content">
        <div class="btn reload-btn" @click="conversation.loadConversationList()">
          {{ $t('conversation_reload') }}
        </div>
      </div>
    </template>
    <CreatChatDialog v-if="createChatDialog" @closeDialog="closeDialog" @createChat="createChat" @createGroupChat="createGroupChat" @joinGroup="joinGroup"></CreatChatDialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CreatChatDialog from '../../ZIMKitCommon/UI/components/create-chat-dialog.vue';
import ZIMKitConversationListVM from '../VM/ZIMKitConversationListVM';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { dateFormat } from '../../ZIMKitCommon/ToolUtil/dateFormat';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { dialogOperation, toastOperation, rightClickDialogOperation } from '../../ZIMKitCommon/ToolUtil/toast';
import ZIMKitConversationVM from '../VM/ZIMKitConversationVM';
@Component({
  components: {
    CreatChatDialog,
  },
})
export default class Conversation extends Vue {
  conversation = ZIMKitConversationListVM.getInstance();
  createChatDialog = false;
  conversationList = new Map();
  isAbnormal = false;
  mounted() {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitConversationListUpdate, [
      (conversationList: Map<string, ZIMKitConversationVM>) => {
        this.conversationList = new Map(conversationList);
      },
    ]);
    ZIMKitConversationListVM.getInstance().registerLoginStateChangedCallback(async (state: number) => {
      state && ZIMKitConversationListVM.getInstance().loadConversationList();
    });
    ZIMKitConversationListVM.getInstance().registerAbnormalCallback((isAbnormal) => {
      this.isAbnormal = isAbnormal;
    });
    if (ZIMKitManager.getInstance().isLoggedIn) {
      ZIMKitConversationListVM.getInstance().loadConversationList();
    }
  }
  beforeDestroy() {
    ZIMKitConversationListVM.getInstance().unInit();
  }
  nameFormat(item: ZIMKitConversationVM) {
    return (item.conversationName || item.conversationID).slice(0, 1).toLowerCase();
  }
  dateFormat(time: string) {
    if (time) {
      return dateFormat(time, false);
    } else {
      return '';
    }
  }
  async switchConversation(item: ZIMKitConversationVM) {
    if (this.conversation.activeConversationID === item.conversationID) {
      return;
    }
    this.conversation.activeConversationID = item.conversationID;
    if (item.unreadMessageCount) {
      item.clearConversationUnreadMessageCount();
    }
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, item);
  }
  triggerDialog() {
    this.createChatDialog = true;
  }
  closeDialog() {
    this.createChatDialog = false;
  }
  createChat(toUserID: string) {
    this.createChatDialog = false;
    const conversationItem = this.conversationList.get(toUserID);
    if (conversationItem) {
      ZIMKitConversationListVM.getInstance().activeConversationID = conversationItem.conversationID;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversationItem);
    } else {
      const conversation = {
        conversationID: toUserID,
        conversationName: '',
        type: 0,
      } as ZIMKitConversationVM;
      this.conversation.activeConversationID = toUserID;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
    }
  }
  createGroupChat(groupName: string, userIDList: string) {
    const userIDListArr = userIDList.split(';');
    ZIMKitGroupListVM.getInstance()
      .createGroup('', groupName, userIDListArr)
      .then((data: any) => {
        console.log('kitlog creategroup data', data);
        const { groupInfo, errorUserList } = data;
        const { baseInfo } = groupInfo;
        if (errorUserList.length) {
          const errorUserIDList = errorUserList.map((item: any) => item.userID).join(' ');
          dialogOperation(true, {
            desc: `${(this.$t('message_user_not_exit_please_again') as string).replace('%s', errorUserIDList)}`,
            confirmText: `${this.$t('common_return')}`,
            hasCloseBtn: false,
          });
          return;
        } else {
          this.createChatDialog = false;
          const conversation = {
            conversationID: baseInfo.groupID,
            conversationName: baseInfo.groupName,
            type: 2,
          } as ZIMKitConversationVM;
          this.conversation.activeConversationID = conversation.conversationID;
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
        }
      });
  }
  operationConversation(e: any, item: any) {
    const data = {
      x: e.pageX,
      y: e.pageY,
      conversationItem: item,
    };
    rightClickDialogOperation(true, data);
    const conversationBox = document.querySelector('.conversation-content') as HTMLDivElement;
    conversationBox.style.overflowY = 'hidden';
  }

  logout() {
    ZIMKitManager.getInstance().disconnectUser();
  }
  async listScroll() {
    const msgElement = document.querySelector('.conversation-content') as HTMLDivElement;
    const scrollTop = Math.round(msgElement.scrollTop);
    const scrollHeight = msgElement.scrollHeight;
    const clientHeight = msgElement.clientHeight;
    if (scrollTop >= scrollHeight - clientHeight) {
      this.conversation.loadNextPage();
    }
    if (scrollTop == 0) {
      // todo reload
    }
  }
  joinGroup(groupID: string) {
    ZIMKitGroupListVM.getInstance()
      .joinGroup(groupID)
      .then((res: any) => {
        if (res) {
          this.createChatDialog = false;
          const conversation = {
            conversationID: res.groupInfo.baseInfo.groupID,
            conversationName: res.groupInfo.baseInfo.groupName,
            type: 2,
          } as ZIMKitConversationVM;
          this.conversation.activeConversationID = conversation.conversationID;
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, conversation);
        }
      })
      .catch((err: any) => {
        switch (err.code) {
          case 6000523:
            {
              dialogOperation(true, {
                desc: `${(this.$t('group_group_id_not_exit') as string).replace('%s', groupID)}`,
                confirmText: `${this.$t('common_return')}`,
                hasCloseBtn: false,
              });
            }
            break;
          case 6000522:
            {
              toastOperation(true, {
                duration: true,
                text: `${this.$t('group_repeat_join_group_chat')}`,
                type: 'default',
              });
            }
            break;
          default:
            {
              toastOperation(true, {
                duration: true,
                text: err.message,
                type: 'default',
              });
            }
            break;
        }
      });
  }
}
</script>

<style lang="less" scoped>
.conversation {
  display: flex;
  width: 350px;
  height: 720px;
  background-color: #fff;
  border-radius: 0 0 0 8px;
  .left-banner {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px 8px;
    width: 70px;
    height: 100%;
    background-color: #f2f2f2;
    border-radius: 0 0 0 8px;
    .item {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 24px;
      padding: 8px 0 6px;
      width: 54px;
      background-color: #fff;
      border-radius: 4px;
      cursor: pointer;
      .icon {
        width: 24px;
        height: 24px;
        background-size: cover;
      }
      .message-icon {
        background-image: url('../UI/assets/images/message-default.png');
      }
      .create-chat-icon {
        background-image: url('../UI/assets/images/create-chat-default.png');
      }
      .exit-icon {
        background-image: url('../UI/assets/images/exit-default.png');
      }
      &:hover {
        .create-chat-text {
          color: #3478fc;
        }
        .create-chat-icon {
          background-image: url('../UI/assets/images/create-chat-hover.png');
        }
        .exit-text {
          color: #ff4a50;
        }
        .exit-icon {
          background-image: url('../UI/assets/images/exit-hover.png');
        }
      }
      .text {
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: #666666;
        line-height: 16px;
      }
      .total {
        position: absolute;
        top: -16px;
        right: -14px;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background-color: #ff4a50;
        font-size: 18px;
        font-weight: 500;
        color: #fff;
        border-radius: 50%;
        transform: scale(0.5);
        line-height: 40px;
        text-align: center;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  .conversation-content {
    padding: 8px 8px 0 8px;
    width: 280px;
    overflow-y: auto;
    .conversation-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      width: 100%;
      height: 68px;
      border-radius: 5px;

      &.actived {
        background: linear-gradient(270deg, #64b0fe 0%, #3478fc 100%);
        .conversation-info {
          .item-message {
            .message-text {
              color: #fff;
            }
          }
        }
        .conversation-info {
          .info-top {
            .item-name,
            .item-date {
              color: #fff;
            }
          }
        }
      }
      &:hover {
        cursor: pointer;
        background-color: #f2f2f2;
      }
      .head-portrait {
        position: relative;
        flex-shrink: 0;
        margin-right: 10px;
        text-align: center;
        width: 44px;
        height: 44px;
        line-height: 42px;
        border-radius: 8px;
        img {
          width: 100%;
          height: 100%;
        }
        .group {
          width: 100%;
          height: 100%;
          background-image: url('../../ZIMKitCommon/UI/assets/images/avatar-group.png');
          background-size: cover;
        }
        .unread-count {
          position: absolute;
          top: -18px;
          right: -16px;
          width: 40px;
          height: 40px;
          background-color: #ff4a50;
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          border-radius: 50%;
          transform: scale(0.5);
          line-height: 40px;
          text-align: center;
        }
      }
      .conversation-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        height: 44px;
        .info-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          .item-name {
            max-width: 110px;
            font-size: 16px;
            font-weight: 500;
            color: #18191a;
            line-height: 22px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .item-date {
            font-size: 12px;
            font-weight: 400;
            font-family: PingFangSC-Regular, PingFang SC;
            color: #b8b8b8;
            line-height: 17px;
          }
        }
        .item-message {
          display: flex;
          align-items: center;
          margin-top: 4px;
          .message-text {
            max-width: 160px;
            height: 18px;
            font-size: 12px;
            font-weight: 500;
            color: #b1b4bb;
            line-height: 18px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
  .default-content {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: 16px;
    font-weight: 400;
    color: #394256;
    .text {
      line-height: 22px;
      text-align: center;
      white-space: pre-wrap;
    }
  }
  .abnormal-content {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
    .reload-btn {
      margin-top: 620px;
      width: 100px;
      height: 36px;
      line-height: 36px;
    }
  }
  .err-icon {
    margin-right: 4px;
    width: 12px;
    height: 12px;
  }
}
</style>
