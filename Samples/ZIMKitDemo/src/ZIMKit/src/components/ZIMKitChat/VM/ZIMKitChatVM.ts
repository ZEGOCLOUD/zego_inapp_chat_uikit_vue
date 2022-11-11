import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitChatModel, ZIMKitFileMessageModel } from '../Model';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { toastOperation } from '../../ZIMKitCommon/ToolUtil/toast';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import i18n from '../../../plugin/i18n';
import { fromZIMKitMessageConvert } from '../ToolUtil/message';
import { ZIMMessage, ZIMGroupMemberListQueriedResult } from '../../ZIMAdapter/index.entity';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
import ZIMKitGroupVM from '../../ZIMKitGroup/VM/ZIMKitGroupVM';
import { ZIMKitGroupMemberModel } from '../../ZIMKitGroup/Model/ZIMKitGroupModel';
import ZIMKitChatListVM from './ZIMKitChatListVM';
import { Mode } from '../Constant';
export default class ZIMKitChatVM extends ZIMKitChatModel {
  public currentMessageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[] = [];
  public messageCount = 30;
  public memberList: ZIMKitGroupMemberModel[] = [];
  public selectedList: ZIMMessage[] = [];
  queryHistoryMessage(conversationID: string, conversationType: number) {
    const config = {
      nextMessage: this.currentMessageList.length ? this.currentMessageList[0].mMessage : undefined,
      count: this.messageCount,
      reverse: true,
    };
    return ZIMKitManager.getInstance()
      .zim.queryHistoryMessage(conversationID, conversationType, config)
      .then((data) => {
        if (data.messageList.length) {
          data.messageList.forEach((message: ZIMMessage) => {
            const newMessage: any = {
              mMessage: message,
            };
            if (conversationType === 2) {
              const member = this.memberList && this.memberList.filter((item) => item.userID === message.senderUserID)[0];
              newMessage.senderUserName = (member && member.userName) || '';
              newMessage.senderUserAvatarUrl = (member && member.memberAvatarUrl) || '';
            }
            if (message.type === 13) {
              newMessage.loadStatus = 0;
              newMessage.isPlaying = false;
            }
            if (!this.currentMessageList.some((item) => item.mMessage.messageID === message.messageID)) {
              this.currentMessageList.push(fromZIMKitMessageConvert(newMessage));
            }
          });
          this.currentMessageList.sort((a, b) => a.mMessage.orderKey - b.mMessage.orderKey);
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
        }
        console.log('kitlog queryHistoryMessage data:', data, 'messageList:', this.currentMessageList);
      });
  }
  sendPeerMessage(text: string) {
    const reg = /\S/;
    if (!reg.test(text)) {
      toastOperation(true, {
        text: `${i18n.t('message_cant_send_empty_msg')}`,
        type: 'default',
      });
      return;
    }
    const config = {
      priority: 1,
    };
    const message: any = fromZIMKitMessageConvert({
      senderUserName: ZIMKitManager.getInstance().userInfo.userName,
      senderUserAvatarUrl: ZIMKitManager.getInstance().userInfo.userAvatarUrl,
      loadStatus: 0,
      mMessage: {
        type: 1,
        message: text,
        senderUserID: ZIMKitManager.getInstance().userInfo.userID,
        sentStatus: 0,
      },
    });
    this.currentMessageList.push(message);
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
    return ZIMKitManager.getInstance()
      .zim.sendPeerMessage(message.mMessage, this.chatID, config)
      .then((data) => {
        console.log('kitlog sendPeerMessage data:', data, 'message:', message, 'messageList:', this.currentMessageList);
      })
      .catch((err) => {
        console.log('kitlog sendPeerMessage err', err);
        switch (err.code) {
          case 6000204:
            {
              const tipMsg: any = fromZIMKitMessageConvert({
                type: 99,
                senderUserName: ZIMKitManager.getInstance().userInfo.userName,
                senderUserAvatarUrl: ZIMKitManager.getInstance().userInfo.userAvatarUrl,
                loadStatus: 0,
                mMessage: {
                  messageID: String(new Date().getTime()),
                  message: `${(i18n.t('message_user_not_exit_please_again') as string).replace('%s', this.chatID)}`,
                  senderUserID: ZIMKitManager.getInstance().userInfo.userID,
                  sentStatus: 0,
                },
              });
              this.currentMessageList.push(tipMsg);
            }
            break;
          case 6000104:
            toastOperation(true, {
              duration: true,
              text: `${i18n.t('message_network_anomaly')}`,
              type: 'default',
            });
            break;
          default:
            toastOperation(true, {
              duration: true,
              text: err.message,
              type: 'default',
            });
            break;
        }
        return err;
      })
      .finally(() => {
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
      });
  }
  sendGroupMessage(text: string) {
    const reg = /\S/;
    if (!reg.test(text)) {
      toastOperation(true, {
        text: `${i18n.t('message_cant_send_empty_msg')}`,
        type: 'default',
      });
      return;
    }
    const config = {
      priority: 1,
    };
    const message: any = fromZIMKitMessageConvert({
      senderUserName: ZIMKitManager.getInstance().userInfo.userName,
      senderUserAvatarUrl: ZIMKitManager.getInstance().userInfo.userAvatarUrl,
      loadStatus: 0,
      mMessage: {
        type: 1,
        message: text,
        senderUserID: ZIMKitManager.getInstance().userInfo.userID,
        sentStatus: 0,
      },
    });
    this.currentMessageList.push(message);
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
    return ZIMKitManager.getInstance()
      .zim.sendGroupMessage(message.mMessage, this.chatID, config)
      .then((data) => {
        console.log('kitlog sendGroupMessage data:', data, 'message:', message, 'messageList:', this.currentMessageList);
      })
      .catch((err) => {
        console.log('kitlog sendGroupMessage err', err);
        switch (err.code) {
          case 6000104:
            toastOperation(true, {
              duration: true,
              text: `${i18n.t('message_network_anomaly')}`,
              type: 'default',
            });
            break;
          default:
            toastOperation(true, {
              duration: true,
              text: err.message,
              type: 'default',
            });
            break;
        }
      })
      .finally(() => {
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
      });
  }
  sendMediaMessage(file: File, progress: any, fileData: any) {
    const config = { priority: 1 };
    const message: any = fromZIMKitMessageConvert({
      senderUserName: ZIMKitManager.getInstance().userInfo.userName,
      senderUserAvatarUrl: ZIMKitManager.getInstance().userInfo.userAvatarUrl,
      loadStatus: 0,
      mMessage: {
        type: fileData.fileType,
        fileLocalPath: file,
        senderUserID: ZIMKitManager.getInstance().userInfo.userID,
        sentStatus: 0,
        messageID: new Date().getTime(),
      },
    });
    if (fileData) {
      switch (fileData.fileType) {
        case 12:
          message.mMessage.fileName = file.name;
          message.mMessage.fileSize = file.size;
          break;
        case 13:
          message.mMessage.audioDuration = fileData.audioDuration;
          break;
        case 14:
          message.mMessage.videoDuration = fileData.videoDuration;
          break;
      }
    }
    this.currentMessageList.push(message);
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
    return ZIMKitManager.getInstance()
      .zim.sendMediaMessage(message.mMessage, this.chatID, this.chatType, config, progress)
      .then((data) => {
        console.log('kitlog sendMediaMessage data:', data, 'message:', JSON.parse(JSON.stringify(message)), 'messageList:', this.currentMessageList);
      })
      .catch((err) => {
        console.log('kitlog sendMediaMessage err:', err);
        switch (err.code) {
          case 6000212:
            toastOperation(true, {
              duration: true,
              text: `${i18n.t('message_size_over_limit')}`,
              type: 'default',
            });
            break;
          case 6000104:
            toastOperation(true, {
              duration: true,
              text: `${i18n.t('message_network_anomaly')}`,
              type: 'default',
            });
            break;
          case 6000214:
            if (err.message.includes('110020')) {
              // image message exceeds the size limit
              toastOperation(true, {
                duration: true,
                text: `${i18n.t('message_photo_size_err_tips')}`,
                type: 'default',
              });
            } else if (err.message.includes('110024')) {
              // video message exceeds the size limit
              toastOperation(true, {
                duration: true,
                text: `${i18n.t('message_video_size_err_tips')}`,
                type: 'default',
              });
            } else if (err.message.includes('110017')) {
              // file message exceeds the size limit
              toastOperation(true, {
                duration: true,
                text: `${i18n.t('message_file_size_err_tips')}`,
                type: 'default',
              });
            }
            break;
          default:
            toastOperation(true, {
              duration: true,
              text: err.message,
              type: 'default',
            });
            break;
        }
      })
      .finally(() => {
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
      });
  }
  async queryCurrentChatGroupMemberList(conversationID: string) {
    const group = ZIMKitGroupListVM.getInstance().groupList.get(conversationID) as ZIMKitGroupVM;
    return ZIMKitGroupListVM.getInstance()
      .queryGroupMemberList(conversationID)
      .then((data: ZIMGroupMemberListQueriedResult) => {
        console.log('kitlog queryGroupMemberList data', data);
        this.memberList = data.userList;
        if (group) {
          group.memberList = data.userList;
        }
        return data.userList;
      })
      .catch((err) => {
        console.log('kitlog queryGroupMemberList err', err);
      });
  }
  deleteMessages(message?: ZIMMessage) {
    const config = {
      isAlsoDeleteServerMessage: true,
    };
    let messageList: ZIMMessage[] = [];
    if (message) {
      messageList.push(message);
    } else {
      messageList = this.selectedList;
    }
    return ZIMKitManager.getInstance()
      .zim.deleteMessages(messageList, this.chatID, this.chatType, config)
      .then((data) => {
        console.log('kitlog deleteMessages data', data);
        messageList.forEach((selectedItem) => {
          const index = this.currentMessageList.findIndex((item) => item.mMessage.messageID === selectedItem.messageID);
          this.currentMessageList.splice(index, 1);
        });
        if (!message) {
          this.selectedList = [];
        }
        toastOperation(true, {
          type: 'default',
          text: `${i18n.t('message_delete_succeed_tips')}`,
        });
      })
      .catch((err) => {
        console.log('kitlog deleteMessages err', err);
      })
      .finally(() => {
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentChatUpdated, this);
        ZIMKitChatListVM.getInstance().mode = Mode['normal'];
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitModeChanged, ZIMKitChatListVM.getInstance().mode);
      });
  }
}
