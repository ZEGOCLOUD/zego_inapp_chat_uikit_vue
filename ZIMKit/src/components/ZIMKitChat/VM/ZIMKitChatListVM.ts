import ZIMKitChatVM from './ZIMKitChatVM';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitConversationVM from '../../ZIMKitConversation/VM/ZIMKitConversationVM';
import { ZIMMessage, ZIMUserInfo, ZIMKitConversationType } from '../../ZIMAdapter/index.entity';
import { ZIMKitMessage, ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from '../Model';
import { fromZIMKitMessageConvert } from '../ToolUtil/message';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { ZIMKitGroupMemberModel } from '../../ZIMKitGroup/Model/ZIMKitGroupModel';
import { Mode } from '../Constant';
import ZIMKitUserVM from '../../ZIMKitUser/VM/ZIMKitUserVM';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
import ZIMKitGroupVM from '../../ZIMKitGroup/VM/ZIMKitGroupVM';
export default class ZIMKitChatListVM {
  private static instance: ZIMKitChatListVM;
  public chatList: Map<string, ZIMKitChatVM> = new Map();
  public currentConversation: ZIMKitConversationVM = {} as ZIMKitConversationVM;
  public currentChat: ZIMKitChatVM = {} as ZIMKitChatVM;
  public mode: number = Mode['normal'];
  constructor() {
    if (!ZIMKitChatListVM.instance) {
      ZIMKitChatListVM.instance = this;
      ZIMKitChatListVM.instance.initListenerHandle();
    }
    return ZIMKitChatListVM.instance;
  }
  static getInstance(): ZIMKitChatListVM {
    if (!ZIMKitChatListVM.instance) {
      ZIMKitChatListVM.instance = new ZIMKitChatListVM();
    }
    return ZIMKitChatListVM.instance;
  }
  // register Kit listener
  initListenerHandle() {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentConversationChanged, [
      async (conversation) => {
        console.log('kitlog conversation changed', conversation, this.currentChat, this.chatList);
        this.mode = Mode['normal'];
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitModeChanged, this.mode);
        if (!conversation.conversationName) {
          const obj = {
            userID: conversation.conversationID,
            userName: conversation.conversationName,
            userAvatarUrl: conversation.conversationAvatarUrl,
          };
          const user = new ZIMKitUserVM(obj);
          user.queryUsersInfo().then(() => {
            conversation.conversationName = user.userName;
            conversation.conversationAvatarUrl = user.userAvatarUrl as string;
          });
        }
        this.currentConversation = conversation;
        if (!this.chatList.get(conversation.conversationID)) {
          this.currentChat = new ZIMKitChatVM(conversation);
        } else {
          this.currentChat = this.chatList.get(conversation.conversationID) as ZIMKitChatVM;
        }
        if (ZIMKitManager.getInstance().networkStatus) {
          if (conversation.type === 2 && !this.currentChat.memberList.length) {
            await this.currentChat.queryCurrentChatGroupMemberList(conversation.conversationID);
          }
          this.currentChat.currentMessageList = [];
          this.currentChat.queryHistoryMessage(this.currentConversation.conversationID, this.currentConversation.type);
        }
        this.chatList.set(conversation.conversationID, this.currentChat);
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatChanged, this.currentChat);
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentConversationUpdate, [
      async (conversation) => {
        console.log('kitlog current conversation update', conversation, this.currentChat, this.chatList.get(conversation.conversationID));
        this.currentConversation = conversation;
        if (conversation.type === 0 && !this.currentChat.chatAvatarUrl) {
          const obj = {
            userID: conversation.conversationID,
            userName: conversation.conversationName,
            userAvatarUrl: conversation.conversationAvatarUrl,
          };
          const user = new ZIMKitUserVM(obj);
          user.queryUsersInfo().then(() => {
            this.currentChat.chatName = this.currentConversation.conversationName;
            this.currentChat.chatAvatarUrl = this.currentConversation.conversationAvatarUrl;
          });
        }
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimReceivePeerMessage, [
      (data) => {
        console.log('kitlog receivePeerMessage', data);
        if (this.currentConversation.conversationID === data.fromConversationID) {
          const messageList = data.messageList.sort((a, b) => a.orderKey - b.orderKey);
          messageList.forEach((message: ZIMMessage) => {
            const newMessage: ZIMKitMessage = {
              mMessage: message,
            };
            if (!this.currentChat.currentMessageList.some((item) => item.mMessage.messageID === message.messageID)) {
              this.currentChat.currentMessageList.push(fromZIMKitMessageConvert(newMessage));
              ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
            }
          });
        }
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimReceiveGroupMessage, [
      async (data) => {
        console.log('kitlog zimReceiveGroupMessage', data, this.currentChat);
        if (this.currentConversation.conversationID === data.fromConversationID) {
          const messageList = data.messageList.sort((a, b) => a.orderKey - b.orderKey);
          messageList.forEach(async (message: ZIMMessage) => {
            let memberList = this.currentChat.memberList;
            let member = memberList && memberList.filter((item) => item.userID === message.senderUserID)[0];
            if (!member) {
              await this.currentChat.queryCurrentChatGroupMemberList(this.currentConversation.conversationID).then(() => {
                memberList = this.currentChat.memberList;
                member = memberList.filter((item: ZIMKitGroupMemberModel) => item.userID === message.senderUserID)[0];
              });
            }
            const newMessage: ZIMKitMessage = {
              mMessage: message,
            };
            newMessage.senderUserName = (member && member.userName) || '';
            newMessage.senderUserAvatarUrl = (member && member.memberAvatarUrl) || '';
            if (!this.currentChat.currentMessageList.some((item) => item.mMessage.messageID === message.messageID)) {
              this.currentChat.currentMessageList.push(fromZIMKitMessageConvert(newMessage));
              ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
            }
          });
        }
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitDeleteConversation, [
      (conversationID) => {
        if (conversationID === this.currentChat.chatID) {
          this.currentChat = {} as ZIMKitChatVM;
          this.currentConversation = {} as ZIMKitConversationVM;
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatChanged, this.currentChat);
        }
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitNetworkChanged, [
      (networkStatus) => {
        if (networkStatus === 1) {
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this.currentChat);
        }
      },
    ]);
  }
  registerLoginUserUpdatedCallback(callback: (userInfo: ZIMUserInfo) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitLoginUserUpdate, [callback]);
  }
  registerCurrentChatChangedCallback(callback: (currentChat: ZIMKitChatVM) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentChatChanged, [callback]);
  }
  removeCurrentChatChangedCallback(callback: (currentChat: ZIMKitChatVM) => void) {
    ZIMKitEventHandler.getInstance().removeEventListener(EventName.zimKitCurrentChatChanged, [callback]);
  }
  registerCurrentChatUpdatedCallback(callback: (currentChat: ZIMKitChatVM) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitCurrentChatUpdated, [callback]);
  }
  removeCurrentChatUpdatedCallback(callback: (currentChat: ZIMKitChatVM) => void) {
    ZIMKitEventHandler.getInstance().removeEventListener(EventName.zimKitCurrentChatUpdated, [callback]);
  }
  registerModeChangedCallback(callback: (mode: number, message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitModeChanged, [callback]);
  }
  removeModeChangedCallback(callback: (mode: number, message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => void) {
    ZIMKitEventHandler.getInstance().removeEventListener(EventName.zimKitModeChanged, [callback]);
  }
  // Using the conversation parameter to show Chat interface
  // Create the session page
  //
  // Description: Create a session page VC first, then you can create a session page by pushing or presenting the VC.
  //
  // @param conversationID : session ID.
  // @param conversationType : session type.
  // @param  conversationName : session name.
  initWithConversationID(conversationID: string, type: ZIMKitConversationType, conversationName?: string) {
    if (type === 2 && !conversationName) {
      const group = ZIMKitGroupListVM.getInstance().groupList.get(conversationID) as ZIMKitGroupVM;
      conversationName = group && group.baseInfo.groupName;
    }
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, { conversationID, type, conversationName });
  }
  unInit() {
    this.chatList = new Map();
    this.currentConversation = {} as ZIMKitConversationVM;
    this.currentChat = {} as ZIMKitChatVM;
  }
}
