import ZIMKitManager from './components/ZIMKitCommon/VM/ZIMKitManager';
import Common from './components/ZIMKitCommon/UI/Common.vue';
import ZIMKiti18n from './plugin/i18n';
import ConversationList from './components/ZIMKitConversation/UI/ZIMKitConversationUI.vue';
import Chat from './components/ZIMKitChat/UI/ZIMKitChatUI.vue';
import GroupInfo from './components/ZIMKitGroup/UI/ZIMKitGroupUI.vue';
import ZIMKitEventHandler from './components/ZIMKitCommon/VM/ZIMKitEventHandler';
import { EventName } from './components/ZIMKitCommon/Constant/event';
import ZIMKitGroupListVM from './components/ZIMKitGroup/VM/ZIMKitGroupListVM';
import ZIMKitChatListVM from './components/ZIMKitChat/VM/ZIMKitChatListVM';
export * from './components/ZIMAdapter/index.entity';

// const Common = {
//   install: (Vue: any) => {
//     Vue.component('common', Common);
//   },
// };
// const ConversationList = {
//   install: (Vue: any) => {
//     Vue.component('conversation', ConversationList);
//   },
// };
// const Chat = {
//   install: (Vue: any) => {
//     Vue.component('message', Chat);
//   },
// };
// const GroupInfo = {
//   install: (Vue: any) => {
//     Vue.component('group', GroupInfo);
//   },
// };
// if (typeof window !== 'undefined' && window.Vue) {
//   window.Vue.use(Common);
//   window.Vue.use(ConversationList);
//   window.Vue.use(Chat);
//   window.Vue.use(GroupInfo);
// }

export { ZIMKitManager, ZIMKiti18n, ZIMKitEventHandler, EventName, ZIMKitGroupListVM, Common, ConversationList, Chat, GroupInfo, ZIMKitChatListVM };
