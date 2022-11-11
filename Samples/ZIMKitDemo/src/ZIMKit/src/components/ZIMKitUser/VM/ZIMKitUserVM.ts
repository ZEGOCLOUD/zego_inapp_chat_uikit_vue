import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { ZIMKitUserInfoModel } from '../Model';
import { ZIMUsersInfoQueriedResult } from '../../ZIMAdapter/index.entity';
export default class ZIMKitUserVM extends ZIMKitUserInfoModel {
  public queryUsersInfo() {
    return ZIMKitManager.getInstance()
      .zim.queryUsersInfo([this.userID], { isQueryFromServer: true })
      .then((data: ZIMUsersInfoQueriedResult) => {
        console.log('kitlog queryUsersInfo success===', data, this);
        data.userList.forEach((item) => {
          if (item.baseInfo.userID === this.userID) {
            this.userName = item.baseInfo.userName;
            this.userAvatarUrl = item.userAvatarUrl;
          }
        });
      })
      .catch((err) => {
        console.log('kitlog queryUsersInfo err', err);
      });
  }
}
