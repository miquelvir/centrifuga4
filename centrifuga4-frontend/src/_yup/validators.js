import * as yup from "yup";
import {
    has_digit,
    has_lowercase,
    has_special,
    has_uppercase,
    longer_8,
    no_plus,
    shorter_64
} from "../_data/password_regex";

export const safe_password = (t) => (
    yup.string()
        .required(t("password_required"))
        .matches(longer_8, t("longer_8"))
        .matches(shorter_64, t("shorter_64"))
        .matches(has_lowercase, t("has_lowercase"))
        .matches(has_uppercase, t("has_uppercase"))
        .matches(has_digit, t("has_digit"))
        .matches(has_special, t("has_special"))
)

export const safe_password_repetition = (t) => (
    yup.string()
        .required(t("password_required"))
        .oneOf([yup.ref('password'), null], t("passwords_unmatched"))
)


const safe_username_email = (t) => (
    yup.string()
        .email(t("invalid_email"))
        .matches(no_plus, t("no_plus"))
)

const safe_username_email_required = (t) => (
    safe_username_email(t).required(t("email_required"))
);


export const safe_username_required = safe_username_email_required;
export const safe_email_required = safe_username_email_required;
export const safe_email = safe_username_email;

export const one_of = (t, options) => yup.string().required(t('field_required'))
                                .test(  // one of the array
                                  'oneOfRequired',
                                  `${t("one_of")}: ${options.toString()}`,
                                  v => options.includes(v)
                                )