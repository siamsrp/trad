import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Standard fallback/English resources
const resources = {
  en: {
    translation: {
      runtime_error: 'Runtime Error',
      reload: 'Reload',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
