<template>
  <div class="chat">
    <template v-if="currentChat.chatID">
      <div class="header">
        <div class="title">{{ currentChat.chatName ? currentChat.chatName : currentChat.chatType === 0 ? $t('message_title_chat') : $t('message_title_group_chat') }}</div>
        <div v-if="currentChat.chatType === 2" class="more-icon"></div>
      </div>
      <div class="message-content" @scroll="listScroll()">
        <div class="message-item" v-for="(item, index) in currentMessageList" :key="item.mMessage.messageID">
          <div class="time-box" v-if="dateFormat(item, currentMessageList[index - 1])">
            {{ dateFormat(item, currentMessageList[index - 1]) }}
          </div>
          <!-- 接收的消息 -->
          <div class="message-box">
            <template v-if="isMultiSelectMode">
              <div class="multi-select">
                <div class="select-icon" :class="{ selected: item.selected }" @click="selectMessage(item)"></div>
              </div>
            </template>
            <template v-if="item.mMessage.senderUserID !== userInfo.userID">
              <div class="left-msg">
                <div class="head-portrait">
                  <template v-if="item.mMessage.conversationType === 0">
                    <img :src="currentChat.chatAvatarUrl ? currentChat.chatAvatarUrl : require('../../ZIMKitCommon/UI/assets/images/avatar-default.png')" />
                  </template>
                  <template v-else>
                    <img :src="item.senderUserAvatarUrl ? item.senderUserAvatarUrl : require('../../ZIMKitCommon/UI/assets/images/avatar-default.png')" />
                  </template>
                </div>
                <div class="message-bubble">
                  <div v-if="item.mMessage.conversationType === 2" class="send-name">{{ item.senderUserName || item.mMessage.senderUserID }}</div>
                  <template v-if="item.mMessage.type === 1">
                    <div class="msg-text" @click.right.prevent="operation($event, item)">{{ item.mMessage.message }}</div>
                  </template>
                  <template v-else-if="item.mMessage.type === 11">
                    <div class="msg-img" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <img :class="`img${item.mMessage.messageID}`" alt="" :style="`width: ${item.thumbnailImgWidth}px;height: ${item.thumbnailImgHeight}px`" />
                    </div>
                    <div class="err-img" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <div class="default-img"></div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 12">
                    <div class="msg-file" @click.right.prevent="operation($event, item)">
                      <div class="file-info">
                        <div class="file-name">{{ item.mMessage.fileName }}</div>
                        <div class="file-size">{{ fileSizeFormat(item.mMessage.fileSize) }}</div>
                      </div>
                      <div class="file-icon" :class="getFileIcon(item)"></div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 13">
                    <div class="msg-audio" :class="{ audioLoading: item.loadStatus === 1 }" @click="playAudio(item)" @click.right.prevent="operation($event, item)" :style="`width:${getAudioWidth(item)}px`">
                      <audio :id="`audio${item.mMessage.messageID}`" :src="item.mMessage.fileDownloadUrl"></audio>
                      <div class="play-animation" :class="{ playing: item.isPlaying }"></div>
                      <div class="audio-length">{{ item.mMessage.audioDuration }}''</div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 14">
                    <div class="msg-video" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <img :class="`img${item.mMessage.messageID}`" alt="" :style="`width: ${item.thumbnailImgWidth}px;height: ${item.thumbnailImgHeight}px`" />
                      <div class="play-icon"></div>
                    </div>
                    <div class="err-video" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <div class="default-img"></div>
                      <div class="play-icon"></div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="msg-text">{{ $t('common_message_unknown') }}</div>
                  </template>
                </div>
              </div>
            </template>
            <!-- 提示错误消息 -->
            <template v-else-if="item.type === 99">
              <div class="center-msg">
                {{ item.mMessage.message }}
              </div>
            </template>
            <!-- 发送的消息 -->
            <template v-else>
              <div class="right-msg">
                <div v-if="item.type !== 99 && item.mMessage.sentStatus === 2" class="err-icon"></div>
                <div v-if="item.mMessage.sentStatus === 0" class="loading"></div>
                <div class="message-bubble">
                  <template v-if="item.mMessage.type === 1">
                    <div class="msg-text" @click.right.prevent="operation($event, item)">{{ item.mMessage.message }}</div>
                  </template>
                  <template v-else-if="item.mMessage.type === 11">
                    <div class="msg-img" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <img :class="`img${item.mMessage.messageID}`" alt="" :style="`width: ${item.thumbnailImgWidth}px;height: ${item.thumbnailImgHeight}px`" />
                    </div>
                    <div class="err-img" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <div class="default-img"></div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 12">
                    <div class="msg-file" @click.right.prevent="operation($event, item)">
                      <div class="file-info">
                        <div class="file-name">{{ item.mMessage.fileName }}</div>
                        <div class="file-size">{{ fileSizeFormat(item.mMessage.fileSize) }}</div>
                      </div>
                      <div class="file-icon" :class="getFileIcon(item)"></div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 13">
                    <div class="msg-audio" :class="{ audioLoading: item.loadStatus === 1 }" @click="playAudio(item)" @click.right.prevent="operation($event, item)" :style="`width:${getAudioWidth(item)}px`">
                      <audio :id="`audio${item.mMessage.messageID}`" :src="item.mMessage.fileDownloadUrl"></audio>
                      <div class="audio-length">{{ item.mMessage.audioDuration }}''</div>
                      <div class="play-animation" :class="{ playing: item.isPlaying }"></div>
                    </div>
                  </template>
                  <template v-else-if="item.mMessage.type === 14">
                    <div class="msg-video" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <img :class="`img${item.mMessage.messageID}`" alt="" :style="`width: ${item.thumbnailImgWidth}px;height: ${item.thumbnailImgHeight}px`" />
                      <div class="play-icon"></div>
                    </div>
                    <div class="err-video" @click="showLargeImg(item)" @click.right.prevent="operation($event, item)" :style="`width: ${item.thumbnailImgConWidth}px;height: ${item.thumbnailImgConHeight}px`">
                      <div class="default-img"></div>
                      <div class="play-icon"></div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="msg-text">{{ $t('common_message_unknown') }}</div>
                  </template>
                </div>
                <div class="head-portrait">
                  <img :src="userInfo.userAvatarUrl ? userInfo.userAvatarUrl : require('../../ZIMKitCommon/UI/assets/images/avatar-default.png')" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <template v-if="isMultiSelectMode">
        <div class="multi-select-operation-box">
          <div class="operation-content">
            <div class="operation-item">
              <div class="operation-icon delete" @click="deleteMessage"></div>
              <div class="operation-desc">{{ $t('conversation_delete') }}</div>
            </div>
          </div>
          <div class="close-icon" @click="closeMultiSelectMode"></div>
        </div>
      </template>
      <template v-else>
        <div class="send-box">
          <div class="tool-box">
            <div class="expression">
              <div v-if="showExpressionBox" class="expression-content">
                <ExpressionBox @addExpression="addExpression"></ExpressionBox>
              </div>
            </div>
            <div class="image-file" @click="clickUploadImageFile">
              <input id="uploadImageFile" type="file" multiple="true" accept="image/png,image/jpg,image/jpeg,image/bmp,image/gif" @change="handleImageChange" />
            </div>
            <div class="video-file" @click="clickUploadVideoFile">
              <input id="uploadVideoFile" type="file" multiple="true" accept=".mp4,.MP4,.mov,.MOV" @change="handleVideoFileChange" />
            </div>
            <div class="other-file" @click="clickUploadFile">
              <input id="uploadFile" type="file" @change="handleFileChange" />
            </div>
          </div>
          <textarea ref="textarea" class="text-area" v-model="message"></textarea>
          <button class="btn send-button" @click="sendMessage" :disabled="!message">{{ $t('message_send') }}</button>
          <!-- <button class="btn send-button" @click="sendMessage" :disabled="!message">发送</button> -->
        </div>
      </template>
    </template>
    <template v-else>
      <div class="default-content">
        <div class="img"></div>
        <div class="text">{{ $t('message_empty_w') }}</div>
      </div>
    </template>
    <LargeImgBox v-if="showLargeImgBox" :largeImg="largeImg" @close="handleCloseLargeImgBox"></LargeImgBox>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ZIMKitChatVM from '../VM/ZIMKitChatVM';
import ZIMKitManager from '../../ZIMKitCommon/VM/ZIMKitManager';
import ZIMKitChatListVM from '../VM/ZIMKitChatListVM';
import { ZIMKitTextMessageModel, ZIMKitImgMessageModel, ZIMKitAudioMessageModel, ZIMKitVideoMessageModel, ZIMKitFileMessageModel } from '../Model';
import { dateFormat } from '../../ZIMKitCommon/ToolUtil/dateFormat';
import ExpressionBox from './components/expression-box.vue';
import LargeImgBox from './components/large-img-box.vue';
import ZIMLazyLoadImg from '../VM/ZIMLazyLoadImg';
import { toastOperation, rightClickDialogOperation, dialogOperation, groupUIOperation } from '../../ZIMKitCommon/ToolUtil/toast';
// import heic2any from 'heic2any';
import { fileSizeFormat } from '../ToolUtil/fileSizeFormat';
import { Mode } from '../Constant';
import bus from '../../ZIMKitCommon/ToolUtil/bus';

@Component({
  components: {
    ExpressionBox,
    LargeImgBox,
  },
})
export default class Message extends Vue {
  showExpressionBox = false;
  currentChat: ZIMKitChatVM = {} as ZIMKitChatVM;
  message = '';
  userInfo = ZIMKitManager.getInstance().userInfo;
  oldScrollHeight = 0;
  newScrollHeight = 0;
  currentMessageList: (ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel)[] = [];
  showLargeImgBox = false;
  largeImg = {};
  audioItem: ZIMKitAudioMessageModel = {} as ZIMKitAudioMessageModel;
  isScrolled = false;
  isMultiSelectMode = ZIMKitChatListVM.getInstance().mode;
  mounted() {
    window.addEventListener('click', this.handleClick);
    ZIMKitChatListVM.getInstance().registerLoginUserUpdatedCallback((userInfo) => {
      this.userInfo = userInfo;
    });
    ZIMKitChatListVM.getInstance().registerCurrentChatChangedCallback(this.currentChatChangedCallback());
    ZIMKitChatListVM.getInstance().registerCurrentChatUpdatedCallback(this.currentChatUpdatedCallback());
    ZIMKitChatListVM.getInstance().registerModeChangedCallback(this.modeChangedCallback());
    ZIMLazyLoadImg.getInstance().registerImgMessageUpdatedCallback((message: ZIMKitImgMessageModel) => {
      this.currentMessageList.forEach((item: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => {
        if (((item as ZIMKitImgMessageModel).mMessage.type === 11 || (item as ZIMKitVideoMessageModel).mMessage.type === 14) && item.mMessage.messageID === message.mMessage.messageID) {
          item = message;
          const img = document.querySelector(`.img${message.mMessage.messageID}`) as HTMLImageElement;
          if (img) {
            message.loadStatus === 2 && ((img.parentElement as HTMLElement).style.zIndex = '2');
            message.loadStatus === 3 && ((img.parentElement as HTMLElement).style.zIndex = '0');
          }
        }
      });
    });
    bus.on('expressionBoxOperation', (type) => {
      type ? (this.showExpressionBox = false) : (this.showExpressionBox = !this.showExpressionBox);
    });
  }
  beforeDestroy() {
    window.removeEventListener('click', this.handleClick);
    ZIMKitChatListVM.getInstance().unInit();
    ZIMKitChatListVM.getInstance().removeCurrentChatChangedCallback(this.currentChatChangedCallback());
    ZIMKitChatListVM.getInstance().removeCurrentChatUpdatedCallback(this.currentChatUpdatedCallback());
    ZIMKitChatListVM.getInstance().removeModeChangedCallback(this.modeChangedCallback());
  }
  currentChatChangedCallback() {
    return (currentChat: ZIMKitChatVM) => {
      console.log('kitlog currentchat change', currentChat, this.currentChat);
      this.currentChat = currentChat;
      this.message = '';
      if (ZIMKitManager.getInstance().networkStatus) {
        this.currentMessageList = [];
      } else {
        this.currentMessageList = this.currentChat.currentMessageList;
      }
      this.isScrolled = false;
      this.$nextTick(() => {
        const textarea = document.getElementsByClassName('text-area')[0] as HTMLTextAreaElement;
        textarea && textarea.focus();
        this.scrollToBottom();
      });
    };
  }
  currentChatUpdatedCallback() {
    return (currentChat: ZIMKitChatVM) => {
      console.log('kitlog current chat update', this.currentChat, currentChat, this.isScrolled);
      if (Object.keys(this.currentChat).length && this.currentChat.chatID !== currentChat.chatID) {
        return;
      }
      const msgContent = document.querySelector('.message-content');
      if (msgContent) {
        if (!this.currentMessageList.length) {
          ZIMLazyLoadImg.getInstance().init('.message-content', '.msg-img');
          ZIMLazyLoadImg.getInstance().initMessageListHandle(currentChat.currentMessageList);
          this.currentMessageList = currentChat.currentMessageList;
          ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(false);
          this.$nextTick(() => {
            !this.isScrolled && this.scrollToBottom();
            ZIMLazyLoadImg.getInstance().loadLatestImgHandle();
          });
          requestAnimationFrame(() => {
            ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(true);
          });
        } else {
          ZIMLazyLoadImg.getInstance().updateMessageHandle(currentChat.currentMessageList);
          this.currentMessageList = currentChat.currentMessageList;
          ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(false);
          this.$nextTick(() => {
            !this.isScrolled && this.scrollToBottom();
            ZIMLazyLoadImg.getInstance().loadImgByMessageHandle(currentChat.currentMessageList);
          });
          requestAnimationFrame(() => {
            ZIMLazyLoadImg.getInstance().setScrollListenSwitchHandle(true);
          });
        }
      }
    };
  }
  modeChangedCallback() {
    return (mode: number, message: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) => {
      this.isMultiSelectMode = mode;
      message && this.selectMessage(message);
    };
  }
  operation(e: any, messageItem: any) {
    if (this.isMultiSelectMode) {
      return;
    }
    const data = {
      x: e.pageX,
      y: e.pageY,
      messageItem,
    };
    rightClickDialogOperation(true, data);
    const msgBox = document.querySelector('.message-content') as HTMLDivElement;
    msgBox.style.overflowY = 'hidden';
  }
  sendMessage() {
    if (this.currentChat.chatType === 2) {
      this.currentChat.sendGroupMessage(this.message);
    } else {
      this.currentChat.sendPeerMessage(this.message);
    }
    this.message = '';
    this.isScrolled = false;
  }
  addExpression(item: string) {
    this.showExpressionBox = false;
    const textarea = document.querySelector('.text-area') as HTMLTextAreaElement;
    textarea.focus();
    const msgArr = this.message.split('');
    const cursorPosition = textarea.selectionStart;
    msgArr.splice(cursorPosition, 0, item);
    this.message = msgArr.join('');
    setTimeout(() => {
      textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
    }, 0);
  }
  showLargeImg(item: ZIMKitImgMessageModel | ZIMKitVideoMessageModel) {
    const arr = item.mMessage.fileName.split('.');
    const type = arr && arr[arr.length - 1].toLocaleLowerCase();
    if (type && /mov/.test(type)) {
      toastOperation(true, {
        text: `${this.$t('message_video_play_error_tips_w')}`,
        type: 'default',
      });
      return;
    }
    if ((item.mMessage.type === 11 && !(item as ZIMKitImgMessageModel).mMessage.largeImageDownloadUrl) || (item.mMessage.type === 14 && !item.mMessage.fileDownloadUrl)) {
      return;
    }
    if (item.mMessage.type === 14 && Object.keys(this.audioItem).length) {
      const dom = document.querySelector(`#audio${this.audioItem.mMessage.messageID}`) as HTMLAudioElement;
      if (dom) {
        dom.pause();
        dom.currentTime = 0;
      }
      this.currentMessageList.filter((item: any) => {
        if (item.mMessage.type === 13 && item.isPlaying) {
          item.isPlaying = false;
        }
      });
      this.audioItem = {} as ZIMKitAudioMessageModel;
    }
    this.showLargeImgBox = true;
    this.largeImg = item;
  }
  handleCloseLargeImgBox() {
    this.showLargeImgBox = false;
    this.largeImg = {};
  }
  clickUploadImageFile() {
    const uploadDom = document.getElementById('uploadImageFile') as HTMLInputElement;
    uploadDom.value = '';
    if (uploadDom) {
      uploadDom.click();
    }
  }
  clickUploadVideoFile() {
    const uploadDom = document.getElementById('uploadVideoFile') as HTMLInputElement;
    uploadDom.value = '';
    if (uploadDom) {
      uploadDom.click();
    }
  }
  clickUploadFile() {
    const uploadDom = document.getElementById('uploadFile') as HTMLInputElement;
    uploadDom.value = '';
    if (uploadDom) {
      uploadDom.click();
    }
  }
  async handleImageChange(event: any) {
    const files = Array.from((event.target as HTMLInputElement).files as FileList);
    if (files) {
      if (files.length > 9) {
        toastOperation(true, {
          text: `${this.$t('message_send_img_exceed_tips_w')}`,
          type: 'default',
        });
        return;
      }
      for (let i = 0; i < files.length; i++) {
        // const suffix = files[i].name.split('.')[1];
        // const newFileName = files[i].name.replace(suffix, 'jpeg');
        // if (suffix.toLowerCase().includes('heic') || suffix.toLowerCase().includes('heif')) {
        //   await heic2any({ blob: files[i], toType: 'image/jpeg' })
        //     .then((blob) => {
        //       const file = new File([blob as Blob], newFileName, { type: 'image/jpeg' });
        //       files[i] = file;
        //     })
        //     .catch(() => {
        //       toastOperation(true, {
        //         text: '图片格式转换失败，请重试',
        //         type: 'default',
        //       });
        //       return;
        //     });
        // }
        this.currentChat.sendMediaMessage(
          files[i],
          (message: any, currentFileSize: number, totalFileSize: number) => {
            console.log('===handleImageChange', message, currentFileSize, totalFileSize);
          },
          {
            fileType: 11,
          },
        );
        this.isScrolled = false;
      }
    }
  }
  handleVideoFileChange(event: any) {
    const files = Array.from((event.target as HTMLInputElement).files as FileList);
    if (files) {
      if (files.length > 9) {
        toastOperation(true, {
          text: `${this.$t('message_send_video_exceed_tips_w')}`,
          type: 'default',
        });
        return;
      }
      for (let i = 0; i < files.length; i++) {
        const video = new Audio(URL.createObjectURL(files[i]));
        video.onloadedmetadata = () => {
          this.currentChat.sendMediaMessage(
            files[i],
            (message: any, currentFileSize: number, totalFileSize: number) => {
              console.log('===handleVideoFileChange', JSON.parse(JSON.stringify(message)), currentFileSize, totalFileSize);
            },
            { fileType: 14, videoDuration: video.duration },
          );
          this.isScrolled = false;
        };
      }
    }
  }
  handleFileChange(event: any) {
    const files = Array.from((event.target as HTMLInputElement).files as FileList);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (!files[i].size) {
          toastOperation(true, {
            text: `${this.$t('message_file_empty_error_tips')}`,
            type: 'default',
          });
          return;
        }
        this.currentChat.sendMediaMessage(
          files[i],
          (message: any, currentFileSize: number, totalFileSize: number) => {
            console.log('===handleVideoFileChange', JSON.parse(JSON.stringify(message)), currentFileSize, totalFileSize);
          },
          { fileType: 12 },
        );
        this.isScrolled = false;
      }
    }
  }
  playAudio(item: ZIMKitAudioMessageModel) {
    item.loadStatus = 1;
    const audioDom = document.querySelector(`#audio${item.mMessage.messageID}`) as HTMLAudioElement;
    this.currentMessageList.filter((item: any) => {
      if (item.mMessage.type === 13 && item.isPlaying) {
        item.isPlaying = false;
      }
    });
    if (Object.keys(this.audioItem).length) {
      const dom = document.querySelector(`#audio${this.audioItem.mMessage.messageID}`) as HTMLAudioElement;
      if (dom) {
        dom.pause();
        dom.currentTime = 0;
      }
      if (this.audioItem.mMessage.messageID !== item.mMessage.messageID) {
        this.startPlayingAudio(item, audioDom);
      } else {
        item.loadStatus = 2;
        item.isPlaying = false;
        this.audioItem = {} as ZIMKitAudioMessageModel;
      }
    } else {
      this.startPlayingAudio(item, audioDom);
    }
  }
  startPlayingAudio(item: ZIMKitAudioMessageModel, audioDom: HTMLAudioElement) {
    if (ZIMKitManager.getInstance().networkStatus && (!audioDom.src || audioDom.src !== item.mMessage.fileDownloadUrl)) {
      audioDom.src = item.mMessage.fileDownloadUrl;
    }
    if (audioDom.error) {
      audioDom.src = '';
      toastOperation(true, {
        text: `${this.$t('message_audio_play_error_tips')}`,
        type: 'default',
      });
      item.loadStatus = 3;
      item.isPlaying = false;
      this.audioItem = {} as ZIMKitAudioMessageModel;
    } else {
      audioDom.play();
    }
    audioDom.onwaiting = () => {
      // console.log('===waiting', audioDom, this.audioItem);
      item.loadStatus = 1;
      item.isPlaying = false;
      this.audioItem = item;
    };
    audioDom.onplaying = () => {
      // console.log('===playing', audioDom, this.audioItem);
      item.loadStatus = 2;
      item.isPlaying = true;
      this.audioItem = item;
    };
    audioDom.onpause = () => {
      // console.log('===pause', audioDom, this.audioItem);
      item.loadStatus = 0;
      item.isPlaying = false;
      this.audioItem = {} as ZIMKitAudioMessageModel;
    };
    audioDom.onended = () => {
      // console.log('===end', audioDom, this.audioItem);
      item.loadStatus = 2;
      item.isPlaying = false;
      this.audioItem = {} as ZIMKitAudioMessageModel;
    };
  }
  getAudioWidth(item: ZIMKitAudioMessageModel) {
    const duration = item.mMessage.audioDuration;
    const width = 70 + (duration / 60) * 204;
    return width > 204 ? 204 : width;
  }
  dateFormat(item: ZIMKitTextMessageModel, previousItem: ZIMKitTextMessageModel) {
    if (!item.mMessage.timestamp) {
      return;
    }
    if (previousItem && item.mMessage.timestamp - previousItem.mMessage.timestamp > 300000) {
      return dateFormat(item.mMessage.timestamp, true);
    }
    if (item.mMessage.messageID === this.currentMessageList[0].mMessage.messageID) {
      return dateFormat(item.mMessage.timestamp, true);
    }
  }
  handleClick(event: MouseEvent) {
    const path = (event as any).path || (event.composedPath && event.composedPath());
    if ((event as any).target.className !== 'expression') {
      const box = document.querySelector('.expression-box');
      let flag = false;
      path.forEach((item: HTMLElement) => {
        if (item === box) {
          flag = true;
        }
      });
      if (box && !flag) {
        this.showExpressionBox = !this.showExpressionBox;
      }
    } else {
      this.showExpressionBox = !this.showExpressionBox;
    }
    if (this.showExpressionBox) {
      const textarea = document.querySelector('.text-area') as HTMLTextAreaElement;
      textarea && textarea.focus();
    }
    if (!(event as any).target.className.includes('more-icon')) {
      const group = document.querySelector('.group-container');
      let flag = false;
      path.forEach((item: HTMLElement) => {
        if (item === group) {
          flag = true;
        }
      });
      if (group && !flag) {
        groupUIOperation();
      }
    } else {
      groupUIOperation();
    }
  }
  getFileIcon(item: ZIMKitFileMessageModel) {
    let icon = '';
    const arr = item.mMessage.fileName && item.mMessage.fileName.split('.');
    const type = arr && arr[arr.length - 1].toLocaleLowerCase();
    if (type) {
      const obj = {
        ppt: /ppt|pptx|pptm/,
        word: /doc|docx|rtf|dot|html|tmp|wps/,
        txt: /txt/,
        pdf: /pdf/,
        excel: /xlsx|xlsm|xlsb|xltx|xltm|xls|xlt|xml|xlr|xlw|xla|xlam/,
        zip: /rar|zip|arj|gz|arj|z/,
        video: /mp4|m4v|mov|qt|avi|flv|wmv|asf|mpeg|mpg|vob|mkv|asf|rm|rmvb|vob|ts|dat|3gp|3gpp|3g2|3gpp2|webm/,
        audio: /mp3|wma|wav|mid|ape|flac|ape|alac|m4a/,
        image: /tiff|heif|heic|jpg|jpeg|png|gif|bmp|webp/,
      };
      Object.entries(obj).forEach(([k, v]) => {
        if (v.test(type)) {
          icon = k + '-icon';
        }
      });
    }
    return icon ? icon : 'unknow-icon';
  }
  fileSizeFormat(fileSize: number) {
    return fileSizeFormat(fileSize);
  }
  selectMessage(item: ZIMKitTextMessageModel | ZIMKitImgMessageModel | ZIMKitAudioMessageModel | ZIMKitVideoMessageModel | ZIMKitFileMessageModel) {
    item.selected = !item.selected;
    if (item.selected) {
      ZIMKitChatListVM.getInstance().currentChat.selectedList.push(item.mMessage);
    } else {
      const index = ZIMKitChatListVM.getInstance().currentChat.selectedList.findIndex((selectedItem) => selectedItem.messageID === item.mMessage.messageID);
      ZIMKitChatListVM.getInstance().currentChat.selectedList.splice(index, 1);
    }
  }
  closeMultiSelectMode() {
    ZIMKitChatListVM.getInstance().mode = Mode['normal'];
    this.isMultiSelectMode = Mode['normal'];
    this.currentMessageList.map((item) => {
      item.selected = false;
    });
    ZIMKitChatListVM.getInstance().currentChat.selectedList = [];
  }
  deleteMessage() {
    if (!ZIMKitChatListVM.getInstance().currentChat.selectedList.length) {
      return;
    }
    dialogOperation(true, {
      desc: `${this.$t('message_delete_confirmation_desc')}`,
      confirmText: `${this.$t('conversation_delete')}`,
      cancelText: `${this.$t('conversation_cancel')}`,
      hasCloseBtn: false,
      confirmFunc: () => {
        ZIMKitChatListVM.getInstance().currentChat.deleteMessages();
      },
    });
  }
  async listScroll() {
    const msgElement = document.querySelector('.message-content') as HTMLDivElement;
    if (msgElement) {
      const scrollTop = Math.round(msgElement.scrollTop);
      const scrollHeight = msgElement.scrollHeight;
      const { currentChat } = this.$data;
      if (scrollTop == 0) {
        this.currentChat.queryHistoryMessage(currentChat.chatID, currentChat.chatType).then(() => {
          this.oldScrollHeight = scrollHeight;
          this.$nextTick(() => {
            this.newScrollHeight = msgElement.scrollHeight;
            msgElement.scrollTop = this.newScrollHeight - this.oldScrollHeight;
          });
        });
      }
      if (scrollTop < scrollHeight - msgElement.clientHeight) {
        this.isScrolled = true;
      } else {
        this.isScrolled = false;
      }
    }
  }
  scrollToBottom() {
    const msgElement = document.querySelector('.message-content') as HTMLDivElement;
    if (msgElement) {
      const scrollTop = Number(msgElement.scrollHeight) - Number(msgElement.clientHeight);
      msgElement.scrollTop = scrollTop;
    }
  }
}
</script>
<style lang="less" scoped>
.chat {
  display: flex;
  flex-direction: column;
  width: 680px;
  height: 720px;
  background-color: #f2f2f2;
  border-radius: 0 0 8px 0;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
    width: 100%;
    height: 56px;
    .title {
      margin-left: 24px;
      font-size: 16px;
      font-weight: 500;
      color: #18191a;
      line-height: 56px;
    }
    .more-icon {
      margin-right: 8px;
      width: 40px;
      height: 40px;
      background-image: url('./assets/images/more-default.png');
      background-size: cover;
      &:hover {
        cursor: pointer;
        background-image: url('./assets/images/more-hover.png');
      }
    }
  }
  .message-content {
    position: relative;
    flex-grow: 1;
    padding: 16px 12px 0 12px;
    height: 200px;
    overflow-y: scroll;
    .message-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8px 0 16px 0;
      .time-box {
        align-self: center;
        margin-bottom: 16px;
        font-size: 12px;
        font-weight: 500;
        color: #b1b4bb;
      }
      .message-box {
        display: flex;
        .multi-select {
          margin: 0 4px 0 12px;
          cursor: pointer;
          .select-icon {
            width: 24px;
            height: 24px;
            border: 2px solid #cbcccc;
            border-radius: 50%;
            &.selected {
              position: relative;
              background-color: #3478fc;
              border: 2px solid #3478fc;
              &::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 7px;
                width: 5px;
                height: 11px;
                background-color: transparent;
                border-radius: 1px;
                border: 2px solid #fff;
                border-top: none;
                border-left: none;
                transform: rotate(45deg);
              }
            }
          }
        }
        .left-msg {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
        }
        .right-msg {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          width: 100%;
          .msg-text {
            background-color: #3478fc;
            color: #fff;
          }
          .msg-audio {
            justify-content: flex-end;
            background-color: #3478fc;
            color: #fff;
            &:active {
              background-color: #175ce6;
            }
            .play-animation {
              background-image: url('./assets/images/white-play-status-03.png');
              &.playing {
                animation: whitePlaying 1s linear infinite;
              }
            }
            @keyframes whitePlaying {
              0% {
                background-image: url('./assets/images/white-play-status-01.png');
              }
              50% {
                background-image: url('./assets/images/white-play-status-02.png');
              }
              100% {
                background-image: url('./assets/images/white-play-status-03.png');
              }
            }
          }
          .message-bubble {
            align-items: flex-end;
            word-break: break-all;
          }
          .err-icon {
            align-self: center;
          }
          .loading {
            margin-right: 8px;
            background-image: url('./assets/images/loading-icon.png');
            background-size: cover;
            width: 18px;
            height: 18px;
            animation: turn 1s linear infinite;
            align-self: center;
          }
          @keyframes turn {
            0% {
              -webkit-transform: rotate(0deg);
            }
            100% {
              -webkit-transform: rotate(360deg);
            }
          }
        }
        .center-msg {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .head-portrait {
          flex-shrink: 0;
          align-self: flex-start;
          text-align: center;
          margin: 0 12px;
          width: 36px;
          height: 36px;
          line-height: 34px;
          border-radius: 8px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .message-bubble {
          position: relative;
          display: flex;
          flex-direction: column;
          .send-name {
            margin-bottom: 4px;
            font-size: 12px;
            font-weight: 400;
            color: #394256;
          }
        }
        .msg-text {
          padding: 11px 12px;
          max-width: 320px;
          background-color: #fff;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 400;
          color: #2a2a2a;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .msg-img {
          z-index: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0;
          bottom: 0;
          overflow: hidden;
          width: 255px;
          height: 255px;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-sizing: border-box;
          img {
            width: 100%;
            height: 100%;
            background-color: #f2f2f2;
          }
          .loading {
            width: 18px;
            height: 18px;
            background-image: url('./assets/images/loading-icon.png');
            background-size: cover;
          }
        }
        .err-img,
        .err-video {
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 255px;
          height: 255px;
          border-radius: 8px;
          border: 1px solid #ddd;
          background-color: #f2f2f2;
          box-sizing: border-box;
          .default-img {
            width: 105px;
            height: 105px;
            background-image: url('./assets/images/default-img.png');
            background-size: cover;
          }
        }
        .err-video {
          width: 170px;
          height: 170px;
          .default-img {
            width: 70px;
            height: 70px;
          }
        }
        .msg-audio {
          display: flex;
          align-items: center;
          padding: 0 4px;
          box-sizing: border-box;
          min-width: 70px;
          height: 44px;
          background-color: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          &:active {
            background-color: #e6e6e6;
          }
          &.audioLoading {
            animation: audioLoading 1s linear infinite;
            .play-animation,
            .audio-length {
              display: none;
            }
          }
          .audio-length {
            font-size: 15px;
            font-weight: 500;
          }
          .play-animation {
            margin: 0 4px;
            width: 22px;
            height: 22px;
            background-image: url('./assets/images/play-status-03.png');
            background-size: cover;
            &.playing {
              animation: playing 1s linear infinite;
            }
          }
          @keyframes playing {
            0% {
              background-image: url('./assets/images/play-status-01.png');
            }
            50% {
              background-image: url('./assets/images/play-status-02.png');
            }
            100% {
              background-image: url('./assets/images/play-status-03.png');
            }
          }
          @keyframes audioLoading {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.6;
            }
            100% {
              opacity: 1;
            }
          }
        }
        .msg-video {
          z-index: -1;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0;
          bottom: 0;
          overflow: hidden;
          width: 170px;
          height: 170px;
          border-radius: 8px;
          border: 1px solid #ddd;
          overflow: hidden;
          box-sizing: border-box;
          img {
            width: 100%;
            height: 100%;
            background-color: #f2f2f2;
          }
        }
        .play-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          background-image: url('./assets/images/video-play-icon.png');
          background-size: cover;
        }
        .msg-file {
          display: flex;
          justify-content: space-between;
          padding: 12px 14px;
          width: 234px;
          height: 64px;
          background-color: #ffffff;
          border-radius: 8px;
          box-sizing: border-box;
          .file-icon {
            width: 40px;
            height: 40px;
            background-size: cover;
            &.unknow-icon {
              background-image: url('./assets/images/unknow-icon.png');
            }
            &.zip-icon {
              background-image: url('./assets/images/compressed-icon.png');
            }
            &.ppt-icon {
              background-image: url('./assets/images/ppt-icon.png');
            }
            &.word-icon {
              background-image: url('./assets/images/word-icon.png');
            }
            &.txt-icon {
              background-image: url('./assets/images/txt-icon.png');
            }
            &.pdf-icon {
              background-image: url('./assets/images/pdf-icon.png');
            }
            &.excel-icon {
              background-image: url('./assets/images/excel-icon.png');
            }
            &.video-icon {
              background-image: url('./assets/images/video-file-icon.png');
            }
            &.audio-icon {
              background-image: url('./assets/images/audio-icon.png');
            }
            &.image-icon {
              background-image: url('./assets/images/picture-icon.png');
            }
          }
          .file-info {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            .file-name {
              max-width: 155px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              font-size: 14px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #18191a;
              line-height: 20px;
            }
            .file-size {
              font-size: 12px;
              font-family: PingFangSC-Regular, PingFang SC;
              font-weight: 400;
              color: #18191a;
              line-height: 17px;
            }
          }
        }
      }
    }
  }
  .send-box {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #e6e6e6;
    width: 100%;
    height: 156px;
    .tool-box {
      display: flex;
      padding: 8px 16px;
      height: 49px;
      .expression {
        position: relative;
        width: 34px;
        height: 34px;
        background-image: url('./assets/images/expression-icon.png');
        background-size: cover;
        cursor: pointer;
        &:hover {
          background-image: url('./assets/images/expression-icon-hover.png');
        }
        .expression-content {
          z-index: 4;
          position: absolute;
          left: 0;
          bottom: 44px;
          // transform: translateX(-50%);
        }
      }
      .image-file {
        margin-left: 16px;
        width: 34px;
        height: 34px;
        background-image: url('./assets/images/image-icon.png');
        background-size: cover;
        cursor: pointer;
        &:hover {
          background-image: url('./assets/images/image-icon-hover.png');
        }
      }
      .video-file {
        margin-left: 16px;
        width: 34px;
        height: 34px;
        background-image: url('./assets/images/video-icon.png');
        background-size: cover;
        cursor: pointer;
        &:hover {
          background-image: url('./assets/images/video-icon-hover.png');
        }
      }
      .other-file {
        margin-left: 16px;
        width: 34px;
        height: 34px;
        background-image: url('./assets/images/file-icon.png');
        background-size: cover;
        cursor: pointer;
        &:hover {
          background-image: url('./assets/images/file-icon-hover.png');
        }
      }
      input {
        display: none;
      }
    }
    .text-area {
      padding: 0 16px;
      width: 100%;
      height: 50px;
      background-color: #f2f2f2;
      font-size: 14px;
      font-weight: 400;
      color: #2a2a2a;
      border: none;
      resize: none;
      outline: none;
      word-break: break-all;
    }
    .send-button {
      align-self: flex-end;
      margin-top: 8px;
      margin-right: 24px;
      width: 72px;
      height: 32px;
      line-height: 32px;
    }
  }
  .multi-select-operation-box {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 108px;
    background-color: #f7f7f7;
    border-top: 1px solid #dfe0e2;
    border-radius: 0px 0px 8px 0px;
    box-sizing: border-box;
    .operation-content {
      display: flex;
      align-items: center;
      .operation-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .operation-icon {
        width: 48px;
        height: 48px;
        background-color: #fff;
        border-radius: 8px;
        cursor: pointer;
        background-size: 32px 32px;
        background-repeat: no-repeat;
        background-position: center;
        &:hover {
          background-color: #e5e6e6;
        }
        &.delete {
          background-image: url('./assets/images/delete-icon.png');
        }
      }
      .operation-desc {
        margin-top: 8px;
        font-size: 12px;
        color: #18191a;
      }
    }
    .close-icon {
      margin: 26px 0 0 16px;
      width: 32px;
      height: 32px;
      background-image: url('./assets/images/multi-select-close-icon.png');
      background-size: cover;
      cursor: pointer;
      &:hover {
        background-image: url('./assets/images/multi-select-close-icon-hover.png');
      }
    }
  }
  .default-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    .img {
      background-image: url('./assets/images/chat-default.png');
      background-size: cover;
      width: 95px;
      height: 89px;
    }
    .text {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 400;
      color: #b1b4bb;
      line-height: 22px;
    }
  }
}
</style>
