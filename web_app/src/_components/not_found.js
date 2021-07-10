import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Box from "@material-ui/core/Box";
import React from "react";
import {themeContext} from "../_context/theme-context";
import {useTranslation} from "react-i18next";
import Typography from "@material-ui/core/Typography";

export default function NotFound({}){
    const themeCtx = React.useContext(themeContext);
    const {t} = useTranslation();

    return  <Typography variant="h1">Nope, not found... 👻</Typography>;
}