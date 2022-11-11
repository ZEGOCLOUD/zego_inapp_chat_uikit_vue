<template>
  <div class="large-img-container">
    <div class="large-img-box">
      <div class="top">
        <div class="close-icon" @click="handleClose"></div>
      </div>
      <div class="content">
        <div class="content-box" :class="{ largeW: isWidthExceed, largeH: isHeightExceed }">
          <img v-if="largeImg.mMessage.type === 11" id="img" />
          <video v-if="largeImg.mMessage.type === 14" id="video" :src="largeImg.mMessage.fileDownloadUrl" autoplay controls controlslist="nodownload noplaybackrate noremoteplayback" disablePictureInPicture="true"></video>
        </div>
        <div class="content-box err-box">
          <div class="err-img"></div>
        </div>
      </div>
      <div class="operation">
        <div v-if="isError" class="btn reload-btn" @click="reload">{{ $t('album_redownload_image') }}</div>
        <div v-else class="operation-item download-icon" @click="handleDownload" title="download"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EventName } from '../../../ZIMKitCommon/Constant/event';
import ZIMKitEventHandler from '../../../ZIMKitCommon/VM/ZIMKitEventHandler';
@Component({})
export default class LargeImgBox extends Vue {
  @Prop(Object) largeImg: any;
  isWidthExceed = false;
  isHeightExceed = false;
  isError = false;
  created() {
    if (this.largeImg.mMessage.type === 11) {
      if (this.largeImg.mMessage.largeImageHeight > 532) {
        const w = (532 / this.largeImg.mMessage.largeImageHeight) * this.largeImg.mMessage.largeImageWidth;
        if (w > 800) {
          this.isWidthExceed = true;
        } else {
          this.isHeightExceed = true;
        }
      }
      if (this.largeImg.mMessage.largeImageWidth > 800) {
        const h = (800 / this.largeImg.mMessage.largeImageWidth) * this.largeImg.mMessage.largeImageHeight;
        if (h > 532) {
          this.isHeightExceed = true;
        } else {
          this.isWidthExceed = true;
        }
      }
    }
  }
  mounted() {
    if (this.largeImg.mMessage.type === 11) {
      this.loadImg();
    } else {
      // this.loadVideo();
    }
    ZIMKitEventHandler.getInstance().addEventListener(EventName.zimKitNetworkChanged, [
      (networkStatus: number) => {
        // console.log('===network', status);
        if (networkStatus === 1) {
          this.reload();
        }
      },
    ]);
  }
  handleDownload() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', this.largeImg.mMessage.fileDownloadUrl, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = this.largeImg.mMessage.fileName; //文件名
        a.click();
      }
    };
    xhr.send();
  }
  handleClose() {
    this.$emit('close');
  }
  loadImg() {
    const img = document.querySelector('#img') as HTMLImageElement;
    const errBox = document.querySelector('.err-box') as HTMLDivElement;
    if (img) {
      img.src = this.largeImg.mMessage.largeImageDownloadUrl;
      img.onload = () => {
        this.isError = false;
        errBox.style.zIndex = '1';
      };
      img.onerror = () => {
        this.isError = true;
        errBox.style.zIndex = '3';
      };
    }
  }
  loadVideo() {
    const videoDom = document.querySelector('#video') as HTMLVideoElement;
    if (videoDom) {
      videoDom.src = this.largeImg.mMessage.fileDownloadUrl;
      videoDom.onloadedmetadata = () => {
        videoDom.play();
      };
    }
  }
  reload() {
    if (this.largeImg.mMessage.type === 11) {
      this.loadImg();
    } else {
      this.loadVideo();
    }
  }
}
</script>
<style scoped>
/*音量按钮*/
video::-webkit-media-controls-volume-control-container {
  display: none !important;
} /*全屏*/
video::-webkit-media-controls-fullscreen-button {
  display: none !important;
}
.large-img-container {
  z-index: 4;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
}
.large-img-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  width: 800px;
  height: 622px;
  background: #f2f2f2;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1), 0px 12px 12px 0px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}
.large-img-box .top {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 40px;
}
.large-img-box .close-icon {
  margin: 8px 12px;
  width: 24px;
  height: 24px;
  background-image: url('../assets/images/close-icon.png');
  background-size: cover;
  cursor: pointer;
}
.large-img-box .content {
  position: relative;
  height: 532px;
}
.large-img-box .content-box {
  z-index: 2;
  position: absolute;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 532px;
  background-color: #f2f2f2;
  overflow: auto;
}
.large-img-box .content-box #video {
  width: 100%;
  height: 100%;
}
.large-img-box .err-box {
  z-index: 1;
  background-color: #f2f2f2;
}
.large-img-box .err-box .err-img {
  width: 140px;
  height: 140px;
  background-image: url('../assets/images/default-img.png');
  background-size: cover;
}
/* .large-img-box .content-box.largeW {
  align-items: flex-start;
} */
.large-img-box .content-box.largeW img {
  width: 100%;
}
.large-img-box .content-box.largeH img {
  height: 100%;
}

.large-img-box .operation {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
}
.operation .operation-item {
  margin: 0 10px;
  width: 24px;
  height: 24px;
  background-size: cover;
  cursor: pointer;
}
.operation .previous-icon {
  background-image: url('../assets/images/previous-icon.png');
}
.operation .next-icon {
  background-image: url('../assets/images/next-icon.png');
}
.operation .download-icon {
  background-image: url('../assets/images/download-icon.png');
}
.operation .reload-btn {
  width: 80px;
  height: 26px;
  line-height: 26px;
  background-color: #0055ff;
  font-size: 12px;
}
</style>
