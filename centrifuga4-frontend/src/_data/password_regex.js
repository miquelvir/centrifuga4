import * as yup from "yup";

export const longer_8 = /^.{8,}$/;
export const smaller_64 = /^.{,64}$/;
export const has_lowercase = /(?=.*[a-z])/;
export const has_uppercase = /(?=.*[A-Z])/;
export const has_digit = /(?=.*\d)/;
export const has_special = /(?=.*[ -\/:-@\[-\`{-~]{1,})/;
export const safe_password = (t) => (
    yup.string()
        .required(t("password_required"))  // todo translate
        .matches(longer_8, t("must be longer than 8 characters"))
        .matches(smaller_64, t("must be smaller than 64 characters"))
        .matches(has_lowercase, t("must have at least 1 lowercase character"))
        .matches(has_uppercase, t("must have at least 1 uppercase character"))
        .matches(has_digit, t("must have at least 1 digit (0-9)"))
        .matches(has_special, t("must have at least 1 of the following '-+_!@#$%^&*.,?'"))
)