import ZIMKitConversationModel from '../Model/ZIMKitConversationModel';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
export default class ZIMKitConversationVM extends ZIMKitConversationModel {
  public clearConversationUnreadMessageCount() {
    ZIMKitManager.getInstance().zim.clearConversationUnreadMessageCount(this.conversationID, this.type);
  }
}
