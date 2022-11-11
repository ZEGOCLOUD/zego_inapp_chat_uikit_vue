<template>
  <div class="login-con">
    <div class="login">
      <div class="login-box">
        <div class="welcome-box">
          <div class="welcome-text">{{ $t('demo_welcome') }}</div>
        </div>
        <div class="form" :class="{ 'en-form': lang.includes('en') }">
          <div class="id">
            <div class="label">{{ $t('demo_user_id_login') }}</div>
            <input :class="{ 'en-input': lang.includes('en') }" v-model="userID" :placeholder="$t('demo_input_placeholder_w')" @input="handleUserIdChange" />
            <div v-if="errTip" class="login-err-tip">{{ $t('demo_input_user_id_error_tips') }}</div>
          </div>
          <div class="name">
            <div class="label">{{ $t('demo_user_name_w') }}</div>
            <div class="user-name">{{ userName }}</div>
          </div>
          <button class="login-btn" @click="loginFun" :disabled="loginDisabled">
            <div v-show="loading" class="loading"></div>
            {{ $t('demo_login') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ZIMKitManager from '../ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager';
import { getToken } from '../util/token';
import { setCacheUserInfo, addCacheUserToList } from '../util/index';
import appConfig from '../keyCenter';
import { getUserName, getAvatar } from '../util/index';
@Component({})
export default class Login extends Vue {
  userID = '';
  userName = '';
  errTip = false;
  loginDisabled = true;
  lang = navigator.language;
  loading = false;
  beforeMount() {
    this.userName = getUserName('').userName;
  }
  handleUserIdChange(event: any) {
    const userID = (event.target as HTMLInputElement).value;
    if (userID.length) {
      this.userName = getUserName(userID).userName;
      if (userID.length < 6 || userID.length > 12) {
        this.errTip = true;
        this.loginDisabled = true;
      } else {
        this.loginDisabled = false;
        this.errTip = false;
      }
    } else {
      this.errTip = false;
      this.loginDisabled = true;
    }
  }
  loginFun() {
    if (appConfig.tokenURL) {
      getToken(this.userID, appConfig).then((token) => {
        this.zimKitLogin(token);
      });
    } else {
      const token = ZIMKitManager.getInstance().generateKitTokenForTest(appConfig.appID, appConfig.serverSecret, this.userID);
      this.zimKitLogin(token);
    }
  }
  zimKitLogin(token: string) {
    console.log('===token', token);
    this.loginDisabled = true;
    this.loading = true;
    const userInfo = {
      userID: this.userID,
      userName: this.userName,
      userAvatarUrl: getAvatar(this.userID),
    };
    ZIMKitManager.getInstance()
      .connectUser(userInfo, token)
      .then(() => {
        this.loginDisabled = false;
        this.loading = false;
        setCacheUserInfo(userInfo);
        addCacheUserToList(userInfo);
        this.$router.push({ name: 'Main' });
      })
      .catch((err) => {
        console.log('kitlog login err', err);
        this.errTip = true;
        this.loginDisabled = true;
        this.loading = false;
      });
  }
}
</script>
<style lang="less" scoped>
.login-con {
  min-height: 560px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #fafafa;
  .login {
    display: flex;
    justify-content: center;
    align-items: center;
    .login-box {
      position: relative;
      display: flex;
      height: 560px;
      background: #ffffff;
      box-shadow: 0px 10px 40px 0px rgba(0, 0, 0, 0.1);
      border-radius: 6px 8px 8px 6px;
      .welcome-box {
        width: 500px;
        height: 560px;
        background-image: url('../assets/img_background.png');
        background-size: cover;
        .welcome-text {
          margin: 67px 0 0 51px;
          font-size: 30px;
          font-weight: 500;
          color: #fff;
          line-height: 50px;
          text-align: left;
          white-space: pre-wrap;
        }
      }
      .form {
        display: flex;
        flex-direction: column;
        margin: 50px 40px;
        padding: 64px 40px 0 40px;
        width: 340px;
        height: 460px;
        box-sizing: border-box;
        .id,
        .name {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 16px;
          .label {
            margin-bottom: 8px;
            font-size: 12px;
            font-weight: 500;
            line-height: 14px;
            color: #394256;
          }
          input {
            padding: 12px 16px;
            width: 260px;
            height: 44px;
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            box-sizing: border-box;
            outline: none;
          }
          .en-input {
            width: 300px;
          }
          input::-webkit-input-placeholder {
            color: #b1b4bb;
          }
          input::-moz-placeholder {
            /* FF 19+ */
            color: #b1b4bb;
          }
          input:-moz-placeholder {
            /* FF 4-18 */
            color: #b1b4bb;
          }
          input:-ms-input-placeholder {
            /* IE 10+ */
            color: #b1b4bb;
          }
          input::-webkit-inner-spin-button,
          input::-webkit-outer-spin-button {
            -webkit-appearance: none;
          }
          input::-webkit-credentials-auto-fill-button {
            display: none;
            visibility: hidden;
          }
          .user-name {
            height: 44px;
            font-size: 14px;
            font-weight: 400;
            font-family: PingFangSC-Regular, PingFang SC;
            color: #18191a;
            line-height: 44px;
          }
        }
        .login-btn {
          display: flex;
          justify-content: center;
          align-items: center;
          align-self: center;
          margin-top: 84px;
          width: 190px;
          height: 48px;
          background-color: #3478fc;
          border-radius: 4px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #fff;
          line-height: 48px;
          cursor: pointer;
          .loading {
            margin-right: 8px;
            background-image: url('../assets/loading-icon.png');
            background-size: cover;
            width: 18px;
            height: 18px;
            animation: turn 1s linear infinite;
          }
          @keyframes turn {
            0% {
              -webkit-transform: rotate(360deg);
            }
            100% {
              -webkit-transform: rotate(0deg);
            }
          }
        }
        button[class='login-btn']:disabled {
          opacity: 0.5;
        }
        .login-err-tip {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 400;
          font-family: PingFangSC-Regular, PingFang SC;
          color: #f64326;
          line-height: 14px;
        }
      }
      .en-form {
        width: 380px;
      }
    }
  }
}
</style>
