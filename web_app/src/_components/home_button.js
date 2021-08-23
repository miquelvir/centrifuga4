import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import HomeIcon from "@material-ui/icons/Home";
import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";

export default function HomeButton({...props}){
    const {t} = useTranslation();
    let history = useHistory();

    return  <Tooltip title={t("home")}
                     style={{float: 'right'}} {...props}>
                <IconButton
                    color="inherit"
                    aria-label={t("home")}
                    onClick={() => history.replace("/home")}>
                    <HomeIcon/>
                </IconButton>
            </Tooltip>;
}