import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { en } from '../../locales/en';
import { zh } from '../../locales/zh';

Vue.use(VueI18n);

let browserLang = 'en_US';
if (navigator.language === 'zh' || navigator.language === 'zh-CN') {
  browserLang = 'zh_CN';
}
const ZIMKiti18n = new VueI18n({
  locale: browserLang,
  fallbackLocale: 'en_US',
  messages: {
    en_US: en,
    zh_CN: zh,
  },
});

export default ZIMKiti18n;
