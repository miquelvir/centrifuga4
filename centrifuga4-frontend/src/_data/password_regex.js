import * as yup from "yup";

export const longer_8 = /^.{8,}$/;
export const shorter_64 = /^.{0,64}$/;
export const has_lowercase = /(?=.*[a-z])/;
export const has_uppercase = /(?=.*[A-Z])/;
export const has_digit = /(?=.*\d)/;
export const has_special = /(?=.*[ -\/:-@\[-\`{-~]{1,})/;
export const no_plus = /^((?!\+).)*$/;
export const safe_password = (t) => (
    yup.string()
        .required(t("password_required"))  // todo translate
        .matches(longer_8, t("longer_8"))
        .matches(shorter_64, t("shorter_64"))
        .matches(has_lowercase, t("has_lowercase"))
        .matches(has_uppercase, t("has_uppercase"))
        .matches(has_digit, t("has_digit"))
        .matches(has_special, t("has_special"))
)
export const password_repetition = (t) => (
    yup.string()
        .required(t("password_required"))
        .oneOf([yup.ref('password'), null], t("passwords_unmatched"))
)
export const safe_username = (t) => (
    yup.string()
        .required(t("email_required"))
        .email(t("invalid_email"))
        .matches(no_plus, t("no_plus"))
)