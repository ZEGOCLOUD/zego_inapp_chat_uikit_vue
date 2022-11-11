<template>
  <div class="dialog">
    <div class="top">
      <div class="title" :class="{ actived: item.actived }" v-for="item in textList" :key="item.id" @click="titleClick(item)">
        {{ $t(item.text) }}
      </div>
    </div>
    <div class="content">
      <template v-if="currentActived === 1">
        <div class="peer">
          <div class="input-box">
            <input :class="{ 'en-input': lang.includes('en') }" type="text" v-model="toUserID" :placeholder="$t('conversation_enter_touserid_w')" @input="toUserIDInput" />
            <div v-if="peerErrTip" class="err-tip">{{ $t('message_input_user_id_error_tips') }}</div>
          </div>
          <div class="btn-box">
            <button class="btn cancel-btn" @click="closeDialog">{{ $t('conversation_cancel') }}</button>
            <button class="btn create-peer-btn" @click="createChat('peer')" :disabled="peerDisabled">{{ $t('conversation_start_single_chat') }}</button>
          </div>
        </div>
      </template>
      <template v-if="currentActived === 2">
        <div class="group">
          <div class="input-box">
            <input :class="{ 'en-input': lang.includes('en') }" type="text" v-model="groupName" :placeholder="$t('group_input_group_name')" @input="groupNameInput" maxlength="12" />
            <input :class="{ 'en-input': lang.includes('en') }" type="text" v-model="userIDList" :placeholder="$t('group_input_user_id_of_group')" @input="userIDListInput" />
            <div v-if="groupErrTip" class="err-tip">{{ $t('message_input_user_id_error_tips') }}</div>
          </div>
          <div class="btn-box">
            <button class="btn cancel-btn" @click="closeDialog">{{ $t('conversation_cancel') }}</button>
            <button class="btn create-peer-btn" @click="createChat('group')" :disabled="groupDisabled">{{ $t('conversation_start_group_chat') }}</button>
          </div>
        </div>
      </template>
      <template v-if="currentActived === 3">
        <div class="attend">
          <div class="input-box">
            <input :class="{ 'en-input': lang.includes('en') }" type="text" v-model="groupID" :placeholder="$t('group_input_group_id_w')" @input="toUserIDInput" />
          </div>
          <div class="btn-box">
            <button class="btn cancel-btn" @click="closeDialog">{{ $t('conversation_cancel') }}</button>
            <button class="btn create-peer-btn" @click="joinGroup" :disabled="!groupID">{{ $t('conversation_join_group_chat') }}</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
@Component({})
export default class CreateChatDialog extends Vue {
  lang: string = navigator.language;
  toUserID = '';
  peerErrTip = false;
  peerDisabled = true;
  groupErrTip = false;
  userIDList = '';
  groupName = '';
  groupID = '';
  groupDisabled = true;
  joinGroupDisabled = true;
  currentActived = 1;
  textList = [
    {
      id: 1,
      text: 'conversation_start_single_chat',
      actived: true,
    },
    {
      id: 2,
      text: 'conversation_start_group_chat',
      actived: false,
    },
    {
      id: 3,
      text: 'conversation_join_group_chat',
      actived: false,
    },
  ];
  titleClick(item: any) {
    this.textList.forEach((item: any) => {
      item.actived = false;
    });
    item.actived = true;
    this.currentActived = item.id;
  }
  createChat(type: string) {
    switch (type) {
      case 'peer':
        this.$emit('createChat', this.toUserID);
        break;
      case 'group':
        this.$emit('createGroupChat', this.groupName, this.userIDList);
    }
  }
  toUserIDInput() {
    if (this.toUserID.length) {
      if (this.toUserID.length < 6 || this.toUserID.length > 12) {
        this.peerDisabled = true;
        this.peerErrTip = true;
      } else {
        this.peerErrTip = false;
        this.peerDisabled = false;
      }
    } else {
      this.peerErrTip = false;
      this.peerDisabled = true;
    }
  }
  groupNameInput() {
    if (this.groupName.length && this.userIDList.length) {
      this.groupDisabled = false;
    } else {
      this.groupDisabled = true;
    }
  }
  userIDListInput() {
    if (this.groupName.length && this.userIDList.length) {
      this.groupDisabled = false;
    } else {
      this.groupDisabled = true;
    }
    if (this.userIDList) {
      const arr = this.userIDList.split(';');
      let flag = false;
      arr.forEach((item: any) => {
        if (item.length < 6 || item.length > 12) {
          flag = true;
          this.groupDisabled = true;
        }
      });
      this.groupErrTip = flag;
    } else {
      this.groupErrTip = false;
    }
  }
  joinGroup() {
    this.$emit('joinGroup', this.groupID);
  }
  closeDialog() {
    this.$emit('closeDialog');
  }
}
</script>
<style lang="less" scoped>
.dialog {
  z-index: 4;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 360px;
  min-height: 214px;
  background-color: #fff;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1), 0px 12px 12px 0px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  .top {
    display: flex;
    justify-content: space-between;
    padding: 0 42px;
    width: 100%;
    height: 48px;
    .title {
      position: relative;
      padding: 0 18px;
      line-height: 48px;
      font-size: 14px;
      font-weight: 400;
      color: #000;
      height: 100%;
      cursor: pointer;
      &.actived {
        font-weight: 500;
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          transform: translate(-50%);
          bottom: 0;
          width: 32px;
          height: 3px;
          background-color: #3478fc;
          border-radius: 4px;
        }
      }
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    padding: 24px;
    width: 100%;
    .peer,
    .group,
    .attend {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      .input-box {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        margin-bottom: 34px;
      }
      .btn-box {
        display: flex;
        justify-content: center;
        align-items: center;
        .cancel-btn,
        .create-peer-btn {
          width: 100px;
          height: 36px;
          line-height: 34px;
        }
        .cancel-btn {
          margin-right: 20px;
          background-color: #fff;
          color: #3478fc;
          border: 1px solid #e8e8e8;
        }
      }
      .err-tip {
        position: absolute;
        bottom: -14px;
      }
    }
    input {
      margin-bottom: 8px;
      padding: 9px 0;
      width: 312px;
      height: 40px;
      border: none;
      border-bottom: 1px solid #ebecec;
      outline: none;
    }
    .en-input {
      width: 410px;
    }
  }
}
</style>
