import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from "./_translations/locales/eng/translation.json";
import translationCAT from "./_translations/locales/cat/translation.json";

export const fallbackLng = ["cat"];
const availableLanguages = ["eng", "cat"];

const resources = {
    eng: {
        translation: translationEN
    },
    cat: {
        translation: translationCAT
    }
};

i18n
    .use(Backend) // load _translations using http (default                                               public/assets/locals/en/_translations)
    .use(LanguageDetector) // detect user language
    .use(initReactI18next) // pass the i18n instance to react-i18next.
    .init({
        resources,
        fallbackLng, // fallback language is english.

        detection: {
            checkWhitelist: true, // options for language detection
        },

        debug: false,

        whitelist: availableLanguages,

        interpolation: {
            escapeValue: false, // no need for react.  it escapes by default
        },
    }).then(_ => ({}));

export default i18n;