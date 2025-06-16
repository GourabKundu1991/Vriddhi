import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import En from './En.json';
import Hn from './Hn.json';
import Bn from './Bn.json';
import Gu from './Gu.json';
import Od from './Od.json';

i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'Eng',
    fallbackLng: 'Eng',
    resources: {
        Eng: En,
        Hn: Hn,
        Bn: Bn,
        Od: Od
    },
    interpolation: {
        escapeValue: false // react already safes from xss
    }
});

export default i18n;