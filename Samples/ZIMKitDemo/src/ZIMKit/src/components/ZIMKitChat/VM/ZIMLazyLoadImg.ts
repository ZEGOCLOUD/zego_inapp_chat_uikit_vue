import { ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from '../Model';
import ZIMKitEventHandler from '../../ZIMKitCommon/VM/ZIMKitEventHandler';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import { EventName } from '../../ZIMKitCommon/Constant/event';
export default class ZIMLazyLoadImg {
  static instance: ZIMLazyLoadImg;
  isInit = false;
  renderContainerID = ''; // The parent container ID of the rendered image
  renderImgID = ''; // The selector ID of the rendered image
  messageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[] = []; // The message list
  maxLoadNum = 10; // The number of images loaded each time
  scrollListenSwitch = true;
  cRatio = 2 / 1; // Critical aspect ratio
  constructor() {
    if (!ZIMLazyLoadImg.instance) {
      ZIMLazyLoadImg.instance = this;
    }
    return ZIMLazyLoadImg.instance;
  }
  static getInstance(): ZIMLazyLoadImg {
    if (!ZIMLazyLoadImg.instance) {
      ZIMLazyLoadImg.instance = new ZIMLazyLoadImg();
    }
    return ZIMLazyLoadImg.instance;
  }
  init(renderContainerID: string, renderImgID: string) {
    this.renderContainerID = renderContainerID;
    this.renderImgID = renderImgID;
    const container = document.querySelector(this.renderContainerID);
    if (container) {
      container.removeEventListener('scroll', this.handleScroll.bind(this));
      container.addEventListener('scroll', this.handleScroll.bind(this));
      this.isInit = true;
    } else {
      this.isInit = false;
    }
  }
  unInit() {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    const container = document.querySelector(this.renderContainerID);
    container && container.removeEventListener('scroll', this.handleScroll);
    this.renderContainerID = '';
    this.renderImgID = '';
    this.messageList.length = 0;
  }
  initMessageListHandle(messageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]) {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    if (messageList) {
      messageList.forEach((message) => {
        if ((message.mMessage.type === 11 && (message as ZIMKitImgMessageModel).mMessage.thumbnailDownloadUrl) || (message.mMessage.type === 14 && (message as ZIMKitVideoMessageModel).mMessage.videoFirstFrameDownloadUrl)) {
          (message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel).loadStatus = 0;
          this.countRenderSizeHandle(message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel);
          ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
        }
      });
      this.messageList = messageList;
    }
  }
  appendMessageHandle(appendMessageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]) {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    appendMessageList.forEach((message) => {
      if ((message.mMessage.type === 11 && (message as ZIMKitImgMessageModel).mMessage.thumbnailDownloadUrl) || (message.mMessage.type === 14 && (message as ZIMKitVideoMessageModel).mMessage.videoFirstFrameDownloadUrl)) {
        (message as ZIMKitImgMessageModel).loadStatus = 0;
        this.countRenderSizeHandle(message as ZIMKitImgMessageModel);
        ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
      }
    });
    this.messageList = this.messageList.concat(appendMessageList);
  }
  updateMessageHandle(updateMessageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]) {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    updateMessageList.forEach((updateMessage) => {
      this.countRenderSizeHandle(updateMessage as ZIMKitImgMessageModel);
    });
    this.messageList = updateMessageList;
  }
  setScrollListenSwitchHandle(scrollListenSwitch: boolean) {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    console.warn('setScrollListenSwitchHandle', scrollListenSwitch);
    this.scrollListenSwitch = !!scrollListenSwitch;
  }
  loadImgByMessageHandle(messageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]) {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    if (this.scrollListenSwitch) {
      return;
    }
    console.warn('loadImgByMessageHandle load');
    this.loadImgHandle(messageList);
  }
  loadLatestImgHandle() {
    if (!this.isInit) {
      throw new Error("Please call the 'init' method first to initialize");
    }
    if (this.scrollListenSwitch) {
      return;
    }
    console.warn('loadLatestImgHandle load');
    this.loadImgHandle(this.messageList.slice(-8));
  }
  registerImgMessageUpdatedCallback(callback: (message: ZIMKitImgMessageModel) => void) {
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitImgMessageUpdated, [callback]);
  }
  private countRenderSizeHandle(message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) {
    if (!message.mMessage.messageID) {
      return;
    }
    let thumbnailImgWidth = 0,
      thumbnailImgHeight = 0,
      thumbnailImgConWidth = 0,
      thumbnailImgConHeight = 0,
      w,
      h,
      maxWH,
      minWH;
    if (message.mMessage.type === 11) {
      w = (message as ZIMKitImgMessageModel).mMessage.thumbnailWidth;
      h = (message as ZIMKitImgMessageModel).mMessage.thumbnailHeight;
      maxWH = 255;
      minWH = 127.5;
    } else {
      w = (message as ZIMKitVideoMessageModel).mMessage.videoFirstFrameWidth;
      h = (message as ZIMKitVideoMessageModel).mMessage.videoFirstFrameHeight;
      maxWH = 170;
      minWH = 85;
    }
    if (!w && !h) {
      thumbnailImgWidth = maxWH;
      thumbnailImgHeight = maxWH;
      thumbnailImgConWidth = maxWH;
      thumbnailImgConHeight = maxWH;
    } else {
      if (w > h) {
        const newH = (h / w) * maxWH;
        if (newH < minWH) {
          thumbnailImgHeight = minWH;
          thumbnailImgWidth = (w / h) * minWH;
          thumbnailImgConWidth = maxWH;
          thumbnailImgConHeight = minWH;
        } else {
          thumbnailImgHeight = newH;
          thumbnailImgWidth = maxWH;
          thumbnailImgConWidth = maxWH;
          thumbnailImgConHeight = newH;
        }
      } else {
        const newW = (w / h) * maxWH;
        if (newW < minWH) {
          thumbnailImgWidth = minWH;
          thumbnailImgHeight = (h / w) * minWH;
          thumbnailImgConWidth = minWH;
          thumbnailImgConHeight = maxWH;
        } else {
          thumbnailImgWidth = newW;
          thumbnailImgHeight = maxWH;
          thumbnailImgConWidth = newW;
          thumbnailImgConHeight = maxWH;
        }
      }
    }
    (message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel).thumbnailImgWidth = thumbnailImgWidth;
    (message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel).thumbnailImgHeight = thumbnailImgHeight;
    (message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel).thumbnailImgConWidth = thumbnailImgConWidth;
    (message as ZIMKitImgMessageModel | ZIMKitVideoMessageModel).thumbnailImgConHeight = thumbnailImgConHeight;
  }
  private handleScroll() {
    if (!this.scrollListenSwitch) {
      return;
    }
    console.warn('handleScroll load');
    this.loadImgHandle(this.messageList);
  }
  private loadImgHandle(messageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[]) {
    messageList.forEach((message) => {
      if (message.mMessage.type === 11 || message.mMessage.type === 14) {
        if (!ZIMKitManager.getInstance().networkStatus && (message as ZIMKitImgMessageModel).loadStatus === 3) {
          return;
        }
        const url = (message as ZIMKitImgMessageModel).mMessage.thumbnailDownloadUrl || (message as ZIMKitVideoMessageModel).mMessage.videoFirstFrameDownloadUrl;
        const img = document.querySelector(`.img${message.mMessage.messageID}`) as HTMLImageElement | null;
        if (url && (message as ZIMKitImgMessageModel).loadStatus !== 1 && (message as ZIMKitImgMessageModel).loadStatus !== 2) {
          // Image message
          if (img && this.countTopHandle(img)) {
            (message as ZIMKitImgMessageModel).loadStatus = 1;
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
            img.src = url;
            img.onload = () => {
              (message as ZIMKitImgMessageModel).loadStatus = 2;
              ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
            };
            img.onerror = () => {
              (message as ZIMKitImgMessageModel).loadStatus = 3;
              ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
            };
          }
        } else {
          if (img && !img.src) {
            img.src = url;
            ZIMKitEventHandler.getInstance().actionListener(EventName.zimKitImgMessageUpdated, message);
          }
        }
      }
    });
  }
  private countTopHandle(img: HTMLImageElement) {
    let isRender = false;
    const container = document.querySelector(this.renderContainerID) as HTMLElement;
    if (container) {
      const scrollTop = container.scrollTop;
      const imgOffsetTop = (img.parentElement?.parentElement as HTMLElement).offsetTop;
      const imgClientHeight = (img.parentElement?.parentElement as HTMLElement).clientHeight;
      const defaultOffset = -150;
      isRender = scrollTop < imgOffsetTop + imgClientHeight - defaultOffset;
    }
    return isRender;
  }
}
