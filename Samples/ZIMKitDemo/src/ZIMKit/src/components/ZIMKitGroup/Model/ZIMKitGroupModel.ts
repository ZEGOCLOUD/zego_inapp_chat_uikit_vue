import { ZIMGroupMemberInfo, ZIMGroupInfo, ZIMGroupMessageNotificationStatus, ZIMGroupFullInfo } from '../../ZIMAdapter/index.entity';

export class ZIMKitGroupMemberModel {
  public memberNickname: string;
  public memberRole: number;
  public userID: string;
  public userName: string;
  public memberAvatarUrl: string;
  constructor(member: ZIMGroupMemberInfo) {
    this.memberNickname = member.memberNickname;
    this.memberRole = member.memberRole;
    this.userID = member.userID;
    this.userName = member.userName;
    this.memberAvatarUrl = member.memberAvatarUrl;
  }
}

export class ZIMKitGroupInfoModel {
  public groupID: string;
  public groupName: string;
  public groupAvatarUrl?: string;
  constructor(groupInfo: ZIMGroupInfo) {
    this.groupID = groupInfo.groupID;
    this.groupName = groupInfo.groupName;
    this.groupAvatarUrl = groupInfo.groupAvatarUrl;
  }
}
export class ZIMKitGroupFullInfoModel {
  public baseInfo: ZIMKitGroupInfoModel;
  public groupNotice: string;
  public notificationStatus: ZIMGroupMessageNotificationStatus;
  public groupAttributes: Record<string, string>;
  constructor(groupFullInfo: ZIMGroupFullInfo) {
    this.baseInfo = groupFullInfo.baseInfo;
    this.groupNotice = groupFullInfo.groupNotice;
    this.notificationStatus = groupFullInfo.notificationStatus;
    this.groupAttributes = groupFullInfo.groupAttributes;
  }
}

export class ZIMKitGroupModel {
  public baseInfo!: ZIMKitGroupInfoModel;
  public notificationStatus?: ZIMGroupMessageNotificationStatus;
  public memberList?: ZIMKitGroupMemberModel[] = [];
  constructor(group: ZIMKitGroupModel) {
    this.notificationStatus = group.notificationStatus;
    this.memberList = group.memberList;
    this.baseInfo = group.baseInfo;
  }
}
