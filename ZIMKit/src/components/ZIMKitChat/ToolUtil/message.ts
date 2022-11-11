import { ZIMKitMessage, ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from '../Model';
const fromZIMKitMessageConvert = (message: ZIMKitMessage) => {
  let msg: ZIMKitMessage = message;
  switch (message.mMessage.type) {
    case 1:
      msg = new ZIMKitTextMessageModel(message as ZIMKitTextMessageModel);
      break;
    case 11:
      msg = new ZIMKitImgMessageModel(message as ZIMKitImgMessageModel);
      break;
    case 12:
      msg = new ZIMKitFileMessageModel(message as ZIMKitFileMessageModel);
      break;
    case 13:
      msg = new ZIMKitAudioMessageModel(message as ZIMKitAudioMessageModel);
      break;
    case 14:
      msg = new ZIMKitVideoMessageModel(message as ZIMKitVideoMessageModel);
      break;
    default:
      break;
  }
  return msg;
};

export { fromZIMKitMessageConvert };
