import {
  ZIMConversationDeleteConfig,
  ZIMConversationDeletedResult,
  ZIMConversationListQueriedResult,
  ZIMConversationQueryConfig,
  ZIMConversationType,
  ZIMConversationUnreadMessageCountClearedResult,
  ZIMEventHandler,
  ZIMGroupAdvancedConfig,
  ZIMGroupCreatedResult,
  ZIMGroupInfo,
  ZIMGroupInfoQueriedResult,
  ZIMGroupJoinedResult,
  ZIMGroupLeftResult,
  ZIMGroupMemberListQueriedResult,
  ZIMGroupMemberQueryConfig,
  ZIMMediaMessage,
  ZIMMediaMessageSentResult,
  // ZIMMediaUploadingProgress,
  ZIMMessage,
  ZIMMessageQueriedResult,
  ZIMMessageQueryConfig,
  ZIMMessageSendConfig,
  ZIMMessageSentResult,
  ZIMPlatform,
  ZIMTokenRenewedResult,
  ZIMUserInfo,
  ZIMUserAvatarUrlUpdatedResult,
  ZIMGroupListQueriedResult,
  ZIMMessageDeleteConfig,
  ZIMMessageDeletedResult,
  ZIMUsersInfoQueryConfig,
  ZIMUsersInfoQueriedResult,
} from './index.entity';
import { ZIMPlatformManage } from './platform';
import { ZIMWeb } from './web';
const platform = window.process ? process.env.PLATFORM || 'web' : 'web';

export class ZIMAdapter {
  static zimPlatformManage: ZIMPlatformManage;
  static zimModule: any;
  static initPlatform(): Promise<void> {
    if (platform === 'web') {
      ZIMAdapter.zimPlatformManage = new ZIMPlatformManage(ZIMPlatform.Web);
      ZIMAdapter.zimModule = ZIMWeb;
      return Promise.resolve();
      // return import('./web').then((zimAdapter) => {
      //   ZIMAdapter.zimModule = zimAdapter.ZIMWeb;
      // });
    } else {
      return Promise.resolve();
    }
  }
  static getInstance() {
    return ZIMAdapter.zimModule.getInstance();
  }
  static create(appID: number) {
    return ZIMAdapter.zimModule.create(appID);
  }
  on<K extends keyof ZIMEventHandler>(type: K, listener: ZIMEventHandler[K]): void {
    return ZIMAdapter.getInstance().on(type, listener);
  }
  off<K extends keyof ZIMEventHandler>(type: K): void {
    return ZIMAdapter.getInstance().off(type);
  }
  login(userInfo: ZIMUserInfo, token: string): Promise<void> {
    return ZIMAdapter.getInstance().login(userInfo, token);
  }
  logout(): void {
    return ZIMAdapter.getInstance().logout();
  }
  destroy(): void {
    return ZIMAdapter.getInstance().destroy();
  }
  renewToken(token: string): Promise<ZIMTokenRenewedResult> {
    return ZIMAdapter.getInstance().renewToken(token);
  }
  queryConversationList(config: ZIMConversationQueryConfig): Promise<ZIMConversationListQueriedResult> {
    return ZIMAdapter.getInstance().queryConversationList(config);
  }
  createGroup(groupInfo: ZIMGroupInfo, userIDs: string[], config?: ZIMGroupAdvancedConfig): Promise<ZIMGroupCreatedResult> {
    return ZIMAdapter.getInstance().createGroup(groupInfo, userIDs, config);
  }
  sendPeerMessage(message: ZIMMessage, toUserID: string, config: ZIMMessageSendConfig): Promise<ZIMMessageSentResult> {
    return ZIMAdapter.getInstance().sendPeerMessage(message, toUserID, config);
  }
  sendGroupMessage(message: ZIMMessage, toGroupID: string, config: ZIMMessageSendConfig): Promise<ZIMMessageSentResult> {
    return ZIMAdapter.getInstance().sendGroupMessage(message, toGroupID, config);
  }
  sendMediaMessage(message: ZIMMediaMessage, toConversationID: string, conversationType: ZIMConversationType, config: ZIMMessageSendConfig, progress: any): Promise<ZIMMediaMessageSentResult> {
    return ZIMAdapter.getInstance().sendMediaMessage(message, toConversationID, conversationType, config, progress);
  }
  queryHistoryMessage(conversationID: string, conversationType: ZIMConversationType, config: ZIMMessageQueryConfig): Promise<ZIMMessageQueriedResult> {
    return ZIMAdapter.getInstance().queryHistoryMessage(conversationID, conversationType, config);
  }
  deleteMessages(messageList: ZIMMessage[], conversationID: string, conversationType: ZIMConversationType, config: ZIMMessageDeleteConfig): Promise<ZIMMessageDeletedResult> {
    return ZIMAdapter.getInstance().deleteMessages(messageList, conversationID, conversationType, config);
  }
  deleteConversation(conversationID: string, conversationType: ZIMConversationType, config: ZIMConversationDeleteConfig): Promise<ZIMConversationDeletedResult> {
    return ZIMAdapter.getInstance().deleteConversation(conversationID, conversationType, config);
  }
  clearConversationUnreadMessageCount(conversationID: string, conversationType: ZIMConversationType): Promise<ZIMConversationUnreadMessageCountClearedResult> {
    return ZIMAdapter.getInstance().clearConversationUnreadMessageCount(conversationID, conversationType);
  }
  queryGroupList(): Promise<ZIMGroupListQueriedResult> {
    return ZIMAdapter.getInstance().queryGroupList();
  }
  queryGroupInfo(groupID: string): Promise<ZIMGroupInfoQueriedResult> {
    return ZIMAdapter.getInstance().queryGroupInfo(groupID);
  }
  queryGroupMemberList(groupID: string, config: ZIMGroupMemberQueryConfig): Promise<ZIMGroupMemberListQueriedResult> {
    return ZIMAdapter.getInstance().queryGroupMemberList(groupID, config);
  }
  joinGroup(groupID: string): Promise<ZIMGroupJoinedResult> {
    return ZIMAdapter.getInstance().joinGroup(groupID);
  }
  leaveGroup(groupID: string): Promise<ZIMGroupLeftResult> {
    return ZIMAdapter.getInstance().leaveGroup(groupID);
  }
  uploadLog(): Promise<void> {
    return ZIMAdapter.getInstance().uploadLog();
  }
  updateUserAvatarUrl(userAvatarUrl: string): Promise<ZIMUserAvatarUrlUpdatedResult> {
    return ZIMAdapter.getInstance().updateUserAvatarUrl(userAvatarUrl);
  }
  queryUsersInfo(userIDs: string[], config: ZIMUsersInfoQueryConfig): Promise<ZIMUsersInfoQueriedResult> {
    return ZIMAdapter.getInstance().queryUsersInfo(userIDs, config);
  }
}
