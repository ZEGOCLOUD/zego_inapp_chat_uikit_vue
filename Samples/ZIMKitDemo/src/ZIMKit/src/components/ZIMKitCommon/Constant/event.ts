export enum EventName {
  zimError = 'error',
  zimConnectionStateChanged = 'connectionStateChanged',
  zimTokenWillExpire = 'tokenWillExpire',
  zimReceivePeerMessage = 'receivePeerMessage',
  zimReceiveGroupMessage = 'receiveGroupMessage',
  zimConversationTotalUnreadMessageCountUpdated = 'conversationTotalUnreadMessageCountUpdated',
  zimConversationChanged = 'conversationChanged',
  zimGroupMemberStateChanged = 'groupMemberStateChanged',
  zimKitDeleteConversation = 'deleteConversation',
  zimKitCurrentConversationUpdate = 'currentConversationUpdate',
  zimKitCurrentConversationChanged = 'currentConversationChanged',
  zimKitConversationListUpdate = 'currentConversationListUpdate',
  zimKitCurrentChatChanged = 'currentChatChanged',
  zimKitCurrentChatUpdated = 'currentChatUpdated',
  zimKitConversationListQueryAbnormally = 'conversationListQueryAbnormally',
  zimKitLoginStateChanged = 'loggedStateChanged',
  zimKitLoginUserUpdate = 'loginUserUpdate',
  zimKitImgMessageUpdated = 'imgMessageUpdated',
  zimKitNetworkChanged = 'networkChanged',
  zimKitModeChanged = 'modeChanged',
}
