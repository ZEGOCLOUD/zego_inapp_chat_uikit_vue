import { ZIMKitGroupModel } from '../Model/ZIMKitGroupModel';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { ZIMGroupMemberListQueriedResult, ZIMGroupInfoQueriedResult } from '../../ZIMAdapter/index.entity';
export default class ZIMKitGroupVM extends ZIMKitGroupModel {
  public queryGroupMemberList() {
    const config = { count: 100, nextFlag: 0 };
    return ZIMKitManager.getInstance()
      .zim.queryGroupMemberList(this.baseInfo.groupID, config)
      .then((data: ZIMGroupMemberListQueriedResult) => {
        console.log('kitlog queryGroupMemberList success', data);
        this.memberList = data.userList;
      })
      .catch((err: any) => {
        console.log('kitlog queryGroupMemberList err', err);
      });
  }
  public queryGroupInfo() {
    return ZIMKitManager.getInstance()
      .zim.queryGroupInfo(this.baseInfo.groupID)
      .then((data: ZIMGroupInfoQueriedResult) => {
        this.baseInfo = data.groupInfo.baseInfo;
      });
  }
}
