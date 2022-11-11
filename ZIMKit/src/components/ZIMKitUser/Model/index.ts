export class ZIMKitUserInfoModel {
  public userID: string;
  public userName: string;
  public userAvatarUrl?: string;
  constructor(user: ZIMKitUserInfoModel) {
    this.userID = user.userID;
    this.userName = user.userName;
    this.userAvatarUrl = user.userAvatarUrl;
  }
}
