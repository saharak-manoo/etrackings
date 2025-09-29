import i18n from 'i18next';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import {initReactI18next} from 'react-i18next';
import en from '../translations/en.json';
import th from '../translations/th.json';

const resources = {
  en: {translation: en},
  th: {translation: th},
};

i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'th'],
    debug: true,
    compatibilityJSON: 'v3',
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default {i18n};
