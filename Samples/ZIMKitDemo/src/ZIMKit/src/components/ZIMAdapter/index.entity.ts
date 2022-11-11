import ZIM, { ZIMError, ZIMEventOfTokenWillExpireResult, ZIMEventOfConnectionStateChangedResult, ZIMEventOfReceiveConversationMessageResult, ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult, ZIMEventOfConversationChangedResult, ZIMEventOfGroupMemberStateChangedResult } from 'zego-zim-web';

// ZIMPlatformManage
export enum ZIMPlatform {
  Web,
}

export default ZIM;
export { ZIMMessageType } from 'zego-zim-web';
// ZIMBase
export type {
  ZIMEventHandler,
  ZIMUserInfo,
  ZIMTokenRenewedResult,
  ZIMConversationQueryConfig,
  ZIMConversationListQueriedResult,
  ZIMGroupInfo,
  ZIMGroupAdvancedConfig,
  ZIMGroupCreatedResult,
  ZIMMessage,
  ZIMMessageSendConfig,
  ZIMMessageSentResult,
  ZIMMessageDirection,
  ZIMMessageSentStatus,
  ZIMMessageQueryConfig,
  ZIMMessageQueriedResult,
  ZIMConversationNotificationStatus,
  ZIMConversationType,
  ZIMError,
  ZIMEventOfConnectionStateChangedResult,
  ZIMEventOfTokenWillExpireResult,
  ZIMEventOfReceiveConversationMessageResult,
  ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult,
  ZIMConversationUnreadMessageCountClearedResult,
  ZIMConversationDeletedResult,
  ZIMConnectionState,
  ZIMConversation,
  ZIMGroupInfoQueriedResult,
  ZIMGroupFullInfo,
  ZIMGroupMemberQueryConfig,
  ZIMGroupMemberListQueriedResult,
  ZIMGroupJoinedResult,
  ZIMGroupLeftResult,
  ZIMGroupMemberInfo,
  ZIMEventOfGroupMemberStateChangedResult,
  ZIMEventOfConversationChangedResult,
  ZIMMediaMessageBase,
  // ZIMMediaUploadingProgress,
  ZIMMediaMessage,
  ZIMTextMessage,
  ZIMImageMessage,
  ZIMAudioMessage,
  ZIMVideoMessage,
  ZIMFileMessage,
  ZIMMediaMessageSentResult,
  ZIMUserAvatarUrlUpdatedResult,
  ZIMUsersInfoQueriedResult,
  ZIMUserFullInfo,
  ZIMConversationDeleteConfig,
  ZIMGroupListQueriedResult,
  ZIMGroupMessageNotificationStatus,
  ZIMGroup,
  ZIMMessageDeleteConfig,
  ZIMMessageDeletedResult,
  ZIMUsersInfoQueryConfig,
} from 'zego-zim-web';

export type ZIMErrorCallback = (zim: ZIM, errorInfo: ZIMError) => void;

export type ZIMConnectionStateChanged = (data: ZIMEventOfConnectionStateChangedResult) => void;

export type ZIMTokenWillExpire = (data: ZIMEventOfTokenWillExpireResult) => void;

export type ZIMReceivePeerMessage = (data: ZIMEventOfReceiveConversationMessageResult) => void;

export type ZIMReceiveGroupMessage = (data: ZIMEventOfReceiveConversationMessageResult) => void;

export type ZIMConversationTotalUnreadMessageCountUpdated = (data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) => void;

export type ZIMConversationChanged = (data: ZIMEventOfConversationChangedResult) => void;

export type ZIMGroupMemberStateChanged = (data: ZIMEventOfGroupMemberStateChangedResult) => void;

export enum ZIMKitConversationType {
  ZIMKitConversationTypePeer = 0,
  ZIMKitConversationTypeGroup = 2,
}
