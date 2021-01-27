/**
 * returns the selected language, defaults to fallbackLng if none is selected
 *
 * @returns string, the selected language
 */
import {fallbackLng} from "../i18nextConf";

export const getCurrentLanguage = () => {
    return localStorage.getItem("i18nextLng") || fallbackLng;
}
