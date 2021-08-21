import React, {useEffect, useState} from 'react';
import * as yup from 'yup';
import XamfraHeader from '../_components/xamfra.header.component';
import Grid from '@material-ui/core/Grid';
import HomeButton from '../_components/home_button';
import {useTranslation} from "react-i18next";
import {makeStyles} from "@material-ui/core/styles";
import WelcomeTitle from "./components/WelcomeTitle";
import Box from "@material-ui/core/Box";
import {themeContext} from "../_context/theme-context";
import {useSnackbar} from "notistack";
import {useErrorHandler} from "../_helpers/handle-response";
import {useNormik} from "../_helpers/normik";
import ThemeButton from "../_components/theme_button.component";
import TranslateButton from "../_components/translate_button.component";
import useTheme from "@material-ui/core/styles/useTheme";
import CourseCard from "./components/CourseCard.js";
import TeacherCoursesService from "../_services/teachers_courses.service";
import {userContext} from "../_context/user-context";
import MoreButton from "./components/MoreButton";
import NotATeacherTitle from './components/NotATeacherTitle';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        
    },
    rootBase: {
        display: 'flex',
        flexDirection: 'column',
        height: "100vh",
    },
    more: {
        width: '100%',
        textAlign: 'center'
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

    const [courses, setCourses] = useState([]);
    const [maxPage, setMaxPage] = useState(null);
    const [loadedUntilPage, setLoadedUntilPage] = useState(0);
    const [attemptLoadedUntilPage, setAttemptLoadedUntilPage] = useState(1);
    const [attemptingLoad, setAttemptingLoad] = useState(false);

    const loading = attemptingLoad && loadedUntilPage == 0;

    const incrementPage = (i=1) => {
        if (maxPage === null) return;
        if (loadedUntilPage >= maxPage) return;
        setAttemptLoadedUntilPage(loadedUntilPage+1);
    }
    
    const userCtx = React.useContext(userContext);
    useEffect(() => {
        if (userCtx.teacher === null || userCtx.teacher === undefined) return;
        
        const page = attemptLoadedUntilPage;
        setAttemptingLoad(true);
        TeacherCoursesService.getAll(null, page, null, null, userCtx.teacher.id).then(...errorHandler({})).then(newCourses => {
            setCourses([...courses, ...newCourses["data"]]);
            setMaxPage(newCourses["_pagination"]["totalPages"]);
            setLoadedUntilPage(page);
        }).finally(() => setAttemptingLoad(false));
    }, [attemptLoadedUntilPage, userCtx.teacher]);

    
    return (
        <Box className={classes.rootBase}>
            <XamfraHeader>
                <TranslateButton/>
                <ThemeButton/>
                <HomeButton/>
            </XamfraHeader>

            <Box p={4} className={classes.root}>
            {
            (userCtx.teacher === null || userCtx.teacher === undefined) && 
              <NotATeacherTitle/>
            }

            {
            !(userCtx.teacher === null || userCtx.teacher === undefined) && 
            <Box>
                <WelcomeTitle/>

                    <Grid container spacing={3} justify="left">
                   
                   {
                       loading &&  [1,2,3,4,5,6,7,8,9, 10].map(_ => <Grid xs={12} sm={6} md={3} key={"loading"} item>
                       <CourseCard course={null}/>
                   </Grid> )
                   }
                    {courses.map(course =>  
                    <Grid xs={12} sm={6} md={3} key={course.id} item>
                <CourseCard course={course}/>
            </Grid> 
                )}
            
            
        </Grid>
            <Box p={2} className={classes.more}>
            {loadedUntilPage < maxPage && <MoreButton onClick={incrementPage} disabled={attemptingLoad}/>}
            </Box>
        </Box>
            }
            </Box>
        </Box>
        );
}

export default TeacherDashboardPage;