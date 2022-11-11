<template>
  <div id="app">
    <router-view />
    <!-- <Common></Common> -->
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ZIMKitManager from './ZIMKit/src/components/ZIMKitCommon/VM/ZIMKitManager';
import { getCacheUserInfo } from './util/index';
import appConfig from './keyCenter';
import Common from './ZIMKit/src/components/ZIMKitCommon/UI/Common.vue';
import { getToken } from './util/token';
@Component({
  components: {
    Common,
  },
})
export default class App extends Vue {
  cacheUserInfo = getCacheUserInfo();
  async beforeMount() {
    // Init IMKitSDK
    await ZIMKitManager.getInstance().init(appConfig.appID);
    if (this.cacheUserInfo) {
      if (appConfig.tokenURL) {
        getToken(this.cacheUserInfo.userID, appConfig).then(async (token: string) => {
          this.zimKitLogin(token);
        });
      } else {
        const token = ZIMKitManager.getInstance().generateKitTokenForTest(appConfig.appID, appConfig.serverSecret, this.cacheUserInfo.userID);
        this.zimKitLogin(token);
      }
    }
  }
  zimKitLogin(token: string) {
    ZIMKitManager.getInstance()
      .connectUser(this.cacheUserInfo, token)
      .then(() => {
        this.$router.push({ name: 'Main' });
      });
  }
}
</script>
<style lang="less">
html {
  height: 100%;
}
body {
  margin: 0;
  height: 100%;
  font-family: PingFangSC-Medium, PingFang SC;
}
#app {
  height: 100%;
}
</style>
