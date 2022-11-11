import { ZIMTextMessage, ZIMImageMessage, ZIMAudioMessage, ZIMVideoMessage, ZIMFileMessage } from '../../ZIMAdapter/index.entity';
import ZIMKitConversationModel from '../../ZIMKitConversation/Model/ZIMKitConversationModel';
export class ZIMKitChatModel {
  public chatID: string;
  public chatType: number;
  public chatName: string;
  public chatAvatarUrl?: string;
  constructor(conversation: ZIMKitConversationModel) {
    this.chatID = conversation.conversationID;
    this.chatType = conversation.type;
    this.chatName = conversation.conversationName;
    this.chatAvatarUrl = conversation.conversationAvatarUrl;
  }
}

export class ZIMKitMessage {
  public mMessage: any;
  public senderUserName?: string;
  public senderUserAvatarUrl?: string;
  public loadStatus?: 0 | 1 | 2 | 3;
  public type?: number;
  public selected?: boolean;
  constructor(message: ZIMKitMessage) {
    this.mMessage = message.mMessage;
    this.senderUserName = message.senderUserName;
    this.senderUserAvatarUrl = message.senderUserAvatarUrl;
    this.loadStatus = message.loadStatus;
    this.type = message.type;
    this.selected = message.selected;
  }
}

export enum ZIMKitMessageType {
  Tip = 99,
}

export class ZIMKitImgMessageModel extends ZIMKitMessage {
  public thumbnailImgWidth?: number;
  public thumbnailImgHeight?: number;
  public thumbnailImgConWidth?: number;
  public thumbnailImgConHeight?: number;
  public mMessage: ZIMImageMessage;
  constructor(message: ZIMKitImgMessageModel) {
    super(message);
    this.thumbnailImgWidth = message.thumbnailImgWidth;
    this.thumbnailImgHeight = message.thumbnailImgHeight;
    this.thumbnailImgConWidth = message.thumbnailImgConWidth;
    this.thumbnailImgConHeight = message.thumbnailImgConHeight;
    this.mMessage = message.mMessage;
  }
}

export class ZIMKitTextMessageModel extends ZIMKitMessage {
  public mMessage: ZIMTextMessage;
  public type: ZIMKitMessageType;
  public message: string;
  constructor(message: ZIMKitTextMessageModel) {
    super(message);
    this.mMessage = message.mMessage;
    this.type = message.type;
    this.message = message.message;
  }
}

export class ZIMKitAudioMessageModel extends ZIMKitMessage {
  public isPlaying: boolean;
  public mMessage: ZIMAudioMessage;
  constructor(message: ZIMKitAudioMessageModel) {
    super(message);
    this.mMessage = message.mMessage;
    this.isPlaying = message.isPlaying;
  }
}

export class ZIMKitVideoMessageModel extends ZIMKitMessage {
  public thumbnailImgWidth?: number;
  public thumbnailImgHeight?: number;
  public thumbnailImgConWidth?: number;
  public thumbnailImgConHeight?: number;
  public mMessage: ZIMVideoMessage;
  constructor(message: ZIMKitVideoMessageModel) {
    super(message);
    this.mMessage = message.mMessage;
    this.thumbnailImgWidth = message.thumbnailImgWidth;
    this.thumbnailImgHeight = message.thumbnailImgHeight;
    this.thumbnailImgConWidth = message.thumbnailImgConWidth;
    this.thumbnailImgConHeight = message.thumbnailImgConHeight;
  }
}

export class ZIMKitFileMessageModel extends ZIMKitMessage {
  public mMessage: ZIMFileMessage;
  constructor(message: ZIMKitFileMessageModel) {
    super(message);
    this.mMessage = message.mMessage;
  }
}
