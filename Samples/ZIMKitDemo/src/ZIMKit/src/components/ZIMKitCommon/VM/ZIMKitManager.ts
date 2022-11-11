import ZIMKitEventHandler, { ZIMKitEventHandlerInterface } from './ZIMKitEventHandler';
import { ZIMAdapter } from '../../ZIMAdapter/index';
import ZIM, { ZIMError, ZIMEventOfConnectionStateChangedResult, ZIMEventOfReceiveConversationMessageResult, ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult, ZIMEventOfConversationChangedResult, ZIMUserAvatarUrlUpdatedResult, ZIMEventOfGroupMemberStateChangedResult } from '../../ZIMAdapter/index.entity';
import { EventName } from '../Constant/event';
import { ZIMKitUserInfoModel } from '../../ZIMKitUser/Model';
import { generateToken } from '../../../plugin/token';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
enum networkStatus {
  online = 1,
  offline = 0,
}

export default class ZIMKitManager {
  private static instance: ZIMKitManager = {} as ZIMKitManager;
  public zim!: ZIMAdapter;
  public userInfo: ZIMKitUserInfoModel = {} as ZIMKitUserInfoModel;
  isLoggedIn = 0;
  token = '';
  networkStatus = networkStatus.online;
  constructor() {
    if (Object.keys(ZIMKitManager.instance).length === 0) {
      ZIMKitManager.instance = this;
    }
    return ZIMKitManager.instance;
  }
  public static getInstance(): ZIMKitManager {
    if (Object.keys(ZIMKitManager.instance).length === 0) {
      ZIMKitManager.instance = new ZIMKitManager();
    }
    return ZIMKitManager.instance;
  }
  // Initialize the ZIMKit.
  //
  // Description: You will need to initialize the ZIMKit SDK before calling methods.
  //
  /// @param appID : appID. To get this, go to ZEGOCLOUD Admin Console (https://console.zegocloud.com/).
  public async init(appID: number) {
    await ZIMAdapter.initPlatform();
    this.zim = ZIMAdapter.create(appID);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.manager = this;
    this.zim.on(EventName.zimError, (zim: ZIM, errorInfo: ZIMError) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimError, errorInfo);
    });
    this.zim.on(EventName.zimConnectionStateChanged, (zim: ZIM, data: ZIMEventOfConnectionStateChangedResult) => {
      console.warn('connectionStateChanged', data);
      switch (data.state) {
        // Disconnected
        case 0: {
          switch (data.event) {
            case 3:
              // If no operation is performed for a long time, you need to log in again
              if (this.userInfo.userID) {
                this.zim.login(this.userInfo, this.token);
              }
              break;
            case 4:
              // kicked offline
              this.disconnectUser();
              break;
          }
        }
      }
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimConnectionStateChanged, data);
    });
    this.zim.on(EventName.zimReceivePeerMessage, (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimReceivePeerMessage, data);
    });
    this.zim.on(EventName.zimReceiveGroupMessage, (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimReceiveGroupMessage, data);
    });
    this.zim.on(EventName.zimConversationTotalUnreadMessageCountUpdated, (zim: ZIM, data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimConversationTotalUnreadMessageCountUpdated, data);
    });
    this.zim.on(EventName.zimConversationChanged, (zim: ZIM, data: ZIMEventOfConversationChangedResult) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimConversationChanged, data);
    });
    this.zim.on(EventName.zimGroupMemberStateChanged, (zim: ZIM, data: ZIMEventOfGroupMemberStateChangedResult) => {
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimGroupMemberStateChanged, data);
    });
    window.addEventListener('offline', () => {
      this.networkStatus = networkStatus.offline;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitNetworkChanged, this.networkStatus);
    });
    window.addEventListener('online', () => {
      this.networkStatus = networkStatus.online;
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitNetworkChanged, this.networkStatus);
    });
  }
  // login
  // Description: Connects user to the ZIMKit server. This method can only be used after calling the [init] method and before you calling any other methods.
  //
  // @param userInfo : user info
  // @param token : generate a Token by referring to our doc (https://docs.zegocloud.com/article/13942).
  public connectUser(userInfo: ZIMKitUserInfoModel, token: string): Promise<void> {
    this.userInfo = userInfo;
    return this.zim.login(userInfo, token).then(() => {
      this.token = token;
      this.isLoggedIn = 1;
      if (userInfo.userAvatarUrl) {
        this.updateUserAvatarUrl(userInfo.userAvatarUrl);
      }
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitLoginStateChanged, this.isLoggedIn);
      ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitLoginUserUpdate, userInfo);
    });
  }
  // Update the user avatar
  //
  // Description: After a successful connection, you can change the user avatar as needed.
  //
  // @param avatarUrl : avatar URL.
  public updateUserAvatarUrl(userAvatarUrl: string) {
    return this.zim.updateUserAvatarUrl(userAvatarUrl).then((data: ZIMUserAvatarUrlUpdatedResult) => {
      this.userInfo.userAvatarUrl = data.userAvatarUrl;
    });
  }
  public generateKitTokenForTest(appID: number, serverSecret: string, userID: string) {
    return generateToken(userID, 0, { appID, serverSecret });
  }
  /// Create a group chat
  ///
  /// Description: You can choose multiple users besides yourself to start a group chat.
  ///
  /// @param groupName group name
  /// @param userIDList user ID list
  public createGroup(groupName: string, userIDList: string[]) {
    return ZIMKitGroupListVM.getInstance()
      .createGroup('', groupName, userIDList)
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        return error;
      });
  }
  /// Join the group chat
  ///
  /// @param groupID groupID
  public joinGroup(groupID: string) {
    return ZIMKitGroupListVM.getInstance()
      .joinGroup(groupID)
      .then((data: any) => {
        return data;
      })
      .catch((error: any) => {
        return error;
      });
  }
  // logout
  // Disconnects current user from ZIMKit server.
  public disconnectUser(): void {
    this.token = '';
    this.isLoggedIn = 0;
    ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitLoginStateChanged, this.isLoggedIn);
    return this.zim.logout();
  }
  public destroy(): void {
    this.offEvent();
    this.zim.destroy();
  }
  // Listen for related event callbacks.
  // @param type : event type.
  // @param callback : event callbacks.
  on<K extends keyof ZIMKitEventHandlerInterface>(type: string, callback: (data: any) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(type as K, [callback] as ZIMKitEventHandlerInterface[K]);
  }
  // Cancel listening for event callbacks.
  // @param type : event type.
  // @param callback : event callbacks.
  off<K extends keyof ZIMKitEventHandlerInterface>(type: string, callback: (data: any) => void) {
    ZIMKitEventHandler.getInstance().removeEventListener(type as K, [callback] as ZIMKitEventHandlerInterface[K]);
  }
  // upload log to zim
  uploadLog(): Promise<void> {
    return this.zim.uploadLog();
  }
  // delete zim listener
  private offEvent() {
    this.zim.off(EventName.zimError);
    this.zim.off(EventName.zimConversationChanged);
    this.zim.off(EventName.zimTokenWillExpire);
    this.zim.off(EventName.zimReceivePeerMessage);
    this.zim.off(EventName.zimReceiveGroupMessage);
    this.zim.off(EventName.zimConversationTotalUnreadMessageCountUpdated);
  }
}
