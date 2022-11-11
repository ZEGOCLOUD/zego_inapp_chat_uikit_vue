import { ZIMConversationType, ZIMMessage, ZIMConversationNotificationStatus } from '../../ZIMAdapter/index.entity';
export default class ZIMKitConversationModel {
  public conversationID: string;
  public conversationName: string;
  public conversationAvatarUrl: string;
  public type: ZIMConversationType;
  public unreadMessageCount: number;
  public lastMessage?: ZIMMessage;
  public orderKey: number;
  public notificationStatus: ZIMConversationNotificationStatus;
  constructor(conversation: any) {
    this.conversationID = conversation.conversationID;
    this.conversationName = conversation.conversationName;
    this.conversationAvatarUrl = conversation.conversationAvatarUrl;
    this.type = conversation.type;
    this.unreadMessageCount = conversation.unreadMessageCount;
    this.lastMessage = conversation.lastMessage;
    this.orderKey = conversation.orderKey;
    this.notificationStatus = conversation.notificationStatus;
  }
}
