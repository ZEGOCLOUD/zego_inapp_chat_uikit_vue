import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { ZIMGroup, ZIMGroupListQueriedResult, ZIMGroupCreatedResult, ZIMGroupJoinedResult, ZIMGroupLeftResult, ZIMEventOfGroupMemberStateChangedResult } from '../../ZIMAdapter/index.entity';
import ZIMKitGroupVM from './ZIMKitGroupVM';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import { EventName } from '../../ZIMKitCommon/Constant/event';
export default class ZIMKitGroupListVM {
  private static instance: ZIMKitGroupListVM;
  public groupList: Map<string, ZIMKitGroupVM> = new Map();
  constructor() {
    if (!ZIMKitGroupListVM.instance) {
      ZIMKitGroupListVM.instance = this;
      ZIMKitGroupListVM.instance.initListenerHandle();
    }
    return ZIMKitGroupListVM.instance;
  }
  public static getInstance(): ZIMKitGroupListVM {
    if (!ZIMKitGroupListVM.instance) {
      this.instance = new ZIMKitGroupListVM();
    }
    return ZIMKitGroupListVM.instance;
  }
  // register Kit listener
  initListenerHandle(): void {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimGroupMemberStateChanged, [
      (data: ZIMEventOfGroupMemberStateChangedResult) => {
        const group = this.groupList.get(data.groupID);
        if (group) {
          group.queryGroupMemberList();
        } else {
          this.queryGroupList().then(() => {
            const group = this.groupList.get(data.groupID) as ZIMKitGroupVM;
            group && group.queryGroupMemberList();
          });
        }
      },
    ]);
  }
  queryGroupList() {
    return ZIMKitManager.getInstance()
      .zim.queryGroupList()
      .then((data: ZIMGroupListQueriedResult) => {
        console.log('kitlog queryGroupList data', data, this.groupList);
        data.groupList.forEach((group: ZIMGroup) => {
          this.groupList.set(group.baseInfo.groupID, new ZIMKitGroupVM(group));
        });
      });
  }
  createGroup(groupID: string, groupName: string, userIDList: string[]) {
    const groupInfo = {
      groupID,
      groupName,
      groupAvatarUrl: '',
    };
    const config = {
      groupNotice: '',
      groupAttributes: {},
    };
    return ZIMKitManager.getInstance()
      .zim.createGroup(groupInfo, userIDList, config)
      .then(async (data: ZIMGroupCreatedResult) => {
        await this.queryGroupList();
        return data;
      });
  }
  joinGroup(groupID: string) {
    return ZIMKitManager.getInstance()
      .zim.joinGroup(groupID)
      .then(async (data: ZIMGroupJoinedResult) => {
        await this.queryGroupList();
        return data;
      });
  }
  leaveGroup(groupID: string) {
    return ZIMKitManager.getInstance()
      .zim.leaveGroup(groupID)
      .then(async (data: ZIMGroupLeftResult) => {
        this.queryGroupList();
        return data;
      });
  }
  queryGroupMemberList(groupID: string) {
    const config = { count: 100, nextFlag: 0 };
    return ZIMKitManager.getInstance().zim.queryGroupMemberList(groupID, config);
  }
  registerLoginStateChangedCallback(callback: (state: number) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitLoginStateChanged, [callback]);
  }
  unInit() {
    this.groupList = new Map();
  }
}
