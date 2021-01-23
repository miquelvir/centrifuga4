import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Box from "@material-ui/core/Box";
import React from "react";
import {themeContext} from "../_context/theme-context";
import {useTranslation} from "react-i18next";
import TranslateIcon from "@material-ui/icons/Translate";
import i18next from "i18next";

export default function TranslateButton({...props}){
    const {t} = useTranslation();

    return  <Tooltip title={t("change_language")} {...props}>
                        <IconButton
                            color="inherit"
                            onClick={() => {
                                const selectedLan = localStorage.getItem("i18nextLng") || "cat";
                                i18next.changeLanguage(selectedLan === "eng"? "cat": "eng").then();
                            }}
                            aria-label={t("change_language")}
                            aria-haspopup="true">
                            <TranslateIcon/>
                        </IconButton>

                    </Tooltip>;
}