import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Box from "@material-ui/core/Box";
import React from "react";
import {themeContext} from "../_context/theme-context";
import {useTranslation} from "react-i18next";
import TranslateIcon from "@material-ui/icons/Translate";
import i18next from "i18next";
import {getCurrentLanguage} from "../_translations/utils";



export default function TranslateButton({...props}){
    const {t} = useTranslation();
    const selectedLanguage = getCurrentLanguage();

    return  <Tooltip title={selectedLanguage === "cat"? t("use_eng"): t("use_cat")} style={{float: 'right'}} {...props}>
                <IconButton
                    color="inherit"
                    onClick={() => {

                        i18next.changeLanguage(getCurrentLanguage() === "eng"? "cat": "eng").then();
                    }}
                    aria-label={selectedLanguage === "cat"? t("use_eng"): t("use_cat")}>
                    <TranslateIcon/>
                </IconButton>

            </Tooltip>;
}