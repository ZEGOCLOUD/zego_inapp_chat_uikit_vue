import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { EventName } from '../../ZIMKitCommon/Constant/event';
import { toastOperation } from '../../ZIMKitCommon/ToolUtil/toast';
import ZIMKitConversationVM from './ZIMKitConversationVM';
import { ZIMError, ZIMConversation, ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult, ZIMEventOfConversationChangedResult, ZIMConversationListQueriedResult, ZIMConversationDeletedResult } from '../../ZIMAdapter/index.entity';
import ZIMKitGroupListVM from '../../ZIMKitGroup/VM/ZIMKitGroupListVM';
export default class ZIMKitConversationListVM {
  private static instance: ZIMKitConversationListVM;
  private pagePullCount = 100;
  private loadStatus = 0; // 0 not loaded 1 loading 2 loaded
  public conversationList: Map<string, ZIMKitConversationVM> = new Map();
  public totalUnreadMessageCount = 0;
  public isAbnormal = false;
  public activeConversationID = '';
  constructor() {
    if (!ZIMKitConversationListVM.instance) {
      ZIMKitConversationListVM.instance = this;
      ZIMKitConversationListVM.instance.initListenerHandle();
    }
    return ZIMKitConversationListVM.instance;
  }
  public static getInstance(): ZIMKitConversationListVM {
    if (!ZIMKitConversationListVM.instance) {
      ZIMKitConversationListVM.instance = new ZIMKitConversationListVM();
    }
    return ZIMKitConversationListVM.instance;
  }
  // register Kit listener
  initListenerHandle(): void {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimConversationTotalUnreadMessageCountUpdated, [
      (data: ZIMEventOfConversationTotalUnreadMessageCountUpdatedResult) => {
        this.totalUnreadMessageCount = data.totalUnreadMessageCount;
      },
    ]);
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimConversationChanged, [
      async (data: ZIMEventOfConversationChangedResult) => {
        console.log('kitlog conversation changed callback', data);
        if (this.loadStatus !== 2) {
          return;
        }
        let updateListFlag = false;
        let updateCurrentConversationFlag = false;
        let changeCurrentConversationFlag = false;
        data.infoList.forEach((info) => {
          switch (info.event) {
            case 1:
              if (this.conversationList.size) {
                let isExist = false;
                if (this.conversationList.get(info.conversation.conversationID)) {
                  isExist = true;
                  this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                  if (this.activeConversationID === info.conversation.conversationID) {
                    updateCurrentConversationFlag = true;
                  }
                  updateListFlag = true;
                }
                if (!isExist) {
                  this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                  updateListFlag = true;
                  if (!this.activeConversationID) {
                    this.activeConversationID = info.conversation.conversationID;
                    changeCurrentConversationFlag = true;
                  }
                }
              } else {
                this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
                this.activeConversationID = info.conversation.conversationID;
                updateListFlag = true;
                changeCurrentConversationFlag = true;
              }
              break;
            case 0:
              this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
              updateListFlag = true;
              if (!this.activeConversationID) {
                console.log('kitlog activecvid', this.activeConversationID, this);
                this.activeConversationID = info.conversation.conversationID;
                changeCurrentConversationFlag = true;
              }
              if (info.conversation.type === 2) {
                ZIMKitGroupListVM.getInstance().queryGroupList();
              }
              break;
            case 2:
              this.conversationList.set(info.conversation.conversationID, new ZIMKitConversationVM(info.conversation));
              if (this.activeConversationID === info.conversation.conversationID) {
                updateCurrentConversationFlag = true;
              }
              updateListFlag = true;
              break;
            default:
              break;
          }
          if (updateListFlag) {
            this.sortConversationList();
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
          }
          const currentConversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
          if (updateCurrentConversationFlag) {
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationUpdate, currentConversation);
            currentConversation.unreadMessageCount && currentConversation.clearConversationUnreadMessageCount();
          }
          if (changeCurrentConversationFlag) {
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, currentConversation);
            currentConversation.unreadMessageCount && currentConversation.clearConversationUnreadMessageCount();
          }
        });
      },
    ]);
  }
  // query conversation list data
  loadConversationList() {
    if (this.loadStatus === 1) {
      return Promise.reject();
    }
    this.loadStatus = 1;
    const config = {
      nextConversation: undefined,
      count: localStorage.count || this.pagePullCount,
    };
    return ZIMKitManager.getInstance()
      .zim.queryConversationList(config)
      .then((data: ZIMConversationListQueriedResult) => {
        console.log('kitlog queryConversationList data', data);
        this.loadStatus = 2;
        this.isAbnormal = false;
        this.conversationList = new Map();
        if (data.conversationList.length) {
          data.conversationList.forEach((item: ZIMConversation) => {
            if (item.type === 0 || item.type === 2) {
              this.conversationList.set(item.conversationID, new ZIMKitConversationVM(item));
            }
          });
          this.sortConversationList();
          if (!this.activeConversationID) {
            this.activeConversationID = Array.from(this.conversationList)[0][0];
          }
          if ((this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM).unreadMessageCount) {
            const conversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
            conversation.clearConversationUnreadMessageCount();
          }
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, this.conversationList.get(this.activeConversationID));
        }
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
      })
      .catch((err: ZIMError) => {
        console.log('kitlog queryConversationList err', err);
        this.isAbnormal = true;
        this.loadStatus = 2;
      });
  }
  // query next page conversation list data
  loadNextPage() {
    const config = {
      nextConversation: Array.from(this.conversationList)[this.conversationList.size - 1][1],
      count: this.pagePullCount,
    };
    return ZIMKitManager.getInstance()
      .zim.queryConversationList(config)
      .then((data: ZIMConversationListQueriedResult) => {
        console.log('kitlog loadNextPage data', data);
        if (data.conversationList.length) {
          data.conversationList.forEach((item: ZIMConversation) => {
            if (item.type === 0 || item.type === 2) {
              this.conversationList.set(item.conversationID, new ZIMKitConversationVM(item));
            }
          });
          this.sortConversationList();
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
        }
      });
  }
  deleteConversation(conversationID: string, conversationType: number) {
    const config = { isAlsoDeleteServerConversation: true };
    return ZIMKitManager.getInstance()
      .zim.deleteConversation(conversationID, conversationType, config)
      .then((data: ZIMConversationDeletedResult) => {
        this.conversationList.delete(data.conversationID);
        if (this.conversationList.size) {
          if (data.conversationID === this.activeConversationID) {
            this.activeConversationID = Array.from(this.conversationList)[0][0];
            const conversation = this.conversationList.get(this.activeConversationID) as ZIMKitConversationVM;
            conversation.unreadMessageCount && conversation.clearConversationUnreadMessageCount();
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitCurrentConversationChanged, this.conversationList.get(Array.from(this.conversationList)[0][0]));
          }
        } else {
          this.activeConversationID = '';
        }
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitConversationListUpdate, this.conversationList);
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitDeleteConversation, conversationID);
      })
      .catch((err: any) => {
        toastOperation(true, {
          duration: true,
          text: err.message,
          type: 'default',
        });
      });
  }
  // conversation list sorted by orderKey
  private sortConversationList() {
    const sortedArr = Array.from(this.conversationList.values()).sort((a, b) => b.orderKey - a.orderKey);
    this.conversationList = new Map(sortedArr.map((value) => [value.conversationID, value]));
  }
  registerLoginStateChangedCallback(callback: (state: number) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitLoginStateChanged, [callback]);
  }
  registerAbnormalCallback(callback: (isAbnormal: boolean) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitConversationListQueryAbnormally, [callback]);
  }
  unInit() {
    this.conversationList = new Map();
    this.totalUnreadMessageCount = 0;
    this.isAbnormal = false;
    this.activeConversationID = '';
    this.loadStatus = 0;
  }
}
