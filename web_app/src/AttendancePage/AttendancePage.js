import React, {useEffect, useState} from 'react';
import XamfraHeader from '../_components/xamfra.header.component';
import HomeButton from '../_components/home_button';
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import ThemeButton from "../_components/theme_button.component";
import TranslateButton from "../_components/translate_button.component";
import Attendance from "./components/attendance.component";
import TeacherDashboardButton from '../_components/teacher_dashboard_button';

const useStyles = makeStyles((theme) => ({
    list: {
        flexGrow: 4
    },
    listCard: {
        height: '100%'
    },
    header: {
    },
    rootBase: {
        display: 'flex',
        flexDirection: 'column',
        height: "100vh",
        minHeight: 0,
        alignItems: 'stretch'
    },
    more: {
        width: '100%',
        textAlign: 'center'
    }
}));

const AttendancePage = (props) => {
    const classes = useStyles();

    return (
        <Box className={classes.rootBase}>
            <XamfraHeader>
            <HomeButton/>
                <TranslateButton/>
                <ThemeButton/>
                <TeacherDashboardButton/>
            </XamfraHeader>
            <Box p={2}>
                <Attendance/>
            </Box>
        </Box>
        );
}

export default AttendancePage;