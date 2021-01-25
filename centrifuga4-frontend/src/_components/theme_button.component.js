import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Box from "@material-ui/core/Box";
import React from "react";
import {themeContext} from "../_context/theme-context";
import {useTranslation} from "react-i18next";

export default function ThemeButton({...props}){
    const themeCtx = React.useContext(themeContext);
    const {t} = useTranslation();

    return  <Tooltip title={themeCtx.theme? t("use_light"): t("use_dark")}
                     style={{float: 'right'}} {...props}>
                <IconButton
                    color="inherit"
                    aria-label={themeCtx.theme? t("use_light"): t("use_dark")}
                    onClick={themeCtx.switchTheme}>
                    <Brightness4Icon/>
                </IconButton>
            </Tooltip>;
}