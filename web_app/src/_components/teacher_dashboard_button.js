import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import React from "react";
import {useTranslation} from "react-i18next";
import { useHistory } from "react-router-dom";

export default function TeacherDashboardButton({...props}){
    const {t} = useTranslation();
    let history = useHistory();

    return  <Tooltip title={t("teacher_dashboard")} style={{float: 'right'}} {...props}>
    <IconButton
        color="inherit"
        onClick={() => history.replace("/teacher-dashboard")}
        aria-label={t("teacher_dashboard")}
        aria-haspopup="false">
        <FolderSharedIcon/>
    </IconButton>
</Tooltip>
;
}