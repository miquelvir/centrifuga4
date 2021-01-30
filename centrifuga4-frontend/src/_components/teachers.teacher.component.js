import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import TeachersDataService from "../_services/teachers.service";
import {useErrorHandler} from "../_helpers/handle-response";
import TeachersCoursesDataService from "../_services/teachers_courses.service";
import TeacherDetails from "./teachers.teacher.details.component";
import TeacherSchedule from "./teachers.teacher.schedule.component";
import {useNeeds} from "../_helpers/needs";
import CoursesDataService from "../_services/courses.service";
import AddDeleteSubresource from "./subresource_add_delete.component";
import TabFrame, {a11yProps} from "./tab";

const useStyles = makeStyles((theme) => ({
  contentPanel: {
    //flex: 1,
      position: 'relative', // todo proper scrollbar
    overflow: "auto",
    boxSizing: "border-box",
      height: '100%', // todo proper,
    display: 'flex',
      flexDirection: 'column'
  },
    content: {
      overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flex: 1,
        height: '100%'
    },
    tab: {
      height: '100%'
    }
}));



export default function Teacher({currentTeacherId, setNewTeacher, addTeacherId, newTeacher, deleteTeacher}) {
  const loading = currentTeacherId === null;

  const errorHandler = useErrorHandler();

  const [teacher, setTeacher] = useState(null);  // todo rename to student

  useEffect(() => {
    if (loading) return setTeacher(null);
    TeachersDataService
            .getOne(currentTeacherId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setTeacher(res["data"]);
                });
  }, [currentTeacherId])

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   useEffect(()=>{
    setValue(0);
  }, [currentTeacherId])

  const handleChangeIndex = (index) => {
    setValue(index);
  };const [hasNeeds, NEEDS] = useNeeds();

  return (
    <Paper elevation={3} square className={classes.contentPanel}>
            <AppBar position="static" color="default">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="on"
                >
                  <Tab label={t("teacher")} {...a11yProps(0)} />

                    { !newTeacher && hasNeeds([NEEDS.schedules]) &&
                  <Tab label={t("schedules")} {...a11yProps(1)} />}

                   { !newTeacher && hasNeeds([NEEDS.courses]) &&
                  <Tab label={t("courses")} {...a11yProps(2)} />}

                </Tabs>
              </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            containerStyle={{height: '100%'}}
            className={classes.content}
            onChangeIndex={handleChangeIndex}
          >

              <TabFrame value={value} index={0}>
                  <TeacherDetails
                    newRoom={newTeacher}
                    setNewRoom={setNewTeacher}
                    dir={theme.direction}
                    currentStudent={teacher}
                    updateCurrentStudent={setTeacher}
                    deleteStudent={deleteTeacher}
              /></TabFrame>


              {hasNeeds([NEEDS.schedules]) && <TabFrame value={value} index={1}>
                  <TeacherSchedule
                                className={classes.tab}
                                dir={theme.direction}
                                scheduleIds={teacher === null ? null : teacher['schedules']}
                                student_id={currentTeacherId}
              /></TabFrame>}

              {hasNeeds([NEEDS.courses]) &&
<TabFrame value={value} index={2}>
              <AddDeleteSubresource
                  defaultSearchBy="name"
                  parentItemDataService={TeachersCoursesDataService}
                  itemDataService={CoursesDataService}
                  add_message_confirm="confirm_enroll_to_course"
                  parent_id={currentTeacherId}
                  secondaryDisplayNameField="description"
                  searchByOptions={["name"]}
                  resourceName={"courses"}
                  displayNameField={"name"}
                  value={value}
                  add_message="enroll_to_course"
                  index={2}
                  onSubresourceAdded={(id) => {
                    setTeacher({
                                ...teacher,
                                courses: [...teacher['courses'], id]
                            })
                  }}
                  onSubresourceDeleted={(id) => {
                     setTeacher({
                                ...teacher,
                                courses: teacher['courses'].filter((c) => c !== id)
                            });
                  }}
              /></TabFrame>}


          </SwipeableViews>

    </Paper>
  );
}
