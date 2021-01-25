/**
 * returns the selected language, defaults to cat if none is selected
 *
 * @returns string, the selected language
 */
export const getCurrentLanguage = () => {
    return localStorage.getItem("i18nextLng") || "cat";
}
