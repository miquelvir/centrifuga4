import React, {useEffect, useRef, useState} from 'react';
import * as yup from 'yup';
import {
    BottomNavigation,
    Card, CardActions,
    Checkbox,
    FormControlLabel, ListItemIcon, ListItemSecondaryAction,
    MenuItem, MobileStepper,
    Step,
    StepLabel,
    Stepper, Tooltip, withStyles
} from "@material-ui/core";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import {useTranslation} from "react-i18next";
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {themeContext} from "../_context/theme-context";
import {useSnackbar} from "notistack";
import i18next from "i18next";
import {useErrorHandler} from "../_helpers/handle-response";
import {useOnMount} from "../_helpers/on-mount";
import ReCAPTCHA from "react-google-recaptcha"
import DirtyTextField from "../_components/dirtytextfield.component";
import Divider from "@material-ui/core/Divider";
import DirtyCountrySelect from "../_components/contry-select.component";
import {education_years} from "../_data/education";
import {emptyAttendee} from "../_data/empty_objects";
import {useNormik} from "../_helpers/normik";
import IconButton from "@material-ui/core/IconButton";
import {student_guardian_relations} from "../_data/relations";
import SearchBar from "../_components/searchbar.component";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import CardContent from "@material-ui/core/CardContent";
import DeleteIcon from "@material-ui/icons/Delete";
import {PUBLIC_URL, RECAPTCHA} from "../config";
import ThemeButton from "../_components/theme_button.component";
import Link from "@material-ui/core/Link";
import TranslateButton from "../_components/translate_button.component";
import {preEnrolmentService} from "../_services/pre-enrolment.service";
import {DNI_OR_NIE_REGEX, safe_email, safe_email_required} from "../_yup/validators";
import {KeyboardArrowLeft, KeyboardArrowRight} from "@material-ui/icons";
import useTheme from "@material-ui/core/styles/useTheme";
import DoneIcon from '@material-ui/icons/Done';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CourseCard from "./components/CourseCard.js";
const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%"
    },
    field: {
        width: "100%",
        margin: "5px"
    },
    cards: {
        '& > *': {
            margin: theme.spacing(3),
        },
    },
    buttons: {
        '& > *': {
            margin: theme.spacing(1),
        },
    }, line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    card: {
    minWidth: 200,
        width: 'fit-content',
        maxWidth: 500,
        display: 'inline-block'
  },
    recaptcha: {
        margin: theme.spacing(4)
    },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
    list: {
        minHeight: '150px',
        overflow: 'auto'
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    }
}));

const TeacherDashboardPage = (props) => {
    const {t} = useTranslation();
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const theme = useTheme();

    const errorHandler = useErrorHandler();
    
    const formik = useNormik(false,{
        initialValues: {},
        validationSchema: yup.object({}),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setStatus();
            setSubmitting(false);
        }
    });

    const themeCtx = React.useContext(themeContext);

    return (
        <Box m={4}>
        <CourseCard course={{
            name: "clarinet",
            "base_schedules": [
                {
                    "course": "613d8c3a-f020-4abd-8964-6942eb0f2a4d", 
                    "course_id": "613d8c3a-f020-4abd-8964-6942eb0f2a4d", 
                    "day_week": 4, 
                    "end_time": "21:45:00", 
                    "id": "baac35d1-f54f-41c6-89ae-78b2b4a6b583", 
                    "start_time": "15:45:00", 
                    "student": null, 
                    "student_id": null
                }
            ], 
            }}/>
        </Box>);
}

export default TeacherDashboardPage;