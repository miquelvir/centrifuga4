import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import CoursesDataService from "../_services/courses.service";
import StudentsDataService from "../_services/students.service";
import TeachersDataService from "../_services/teachers.service";
import CourseRoomsDataService from "../_services/course_rooms.service";
import RoomsDataService from "../_services/rooms.service";
import {useErrorHandler} from "../_helpers/handle-response";
import CourseStudentsDataService from "../_services/course_students.service";
import CourseTeachersDataService from "../_services/course_teachers.service";
import CourseDetails from "./courses.course.details.component";
import CourseLabels from "./courses.course.labels.component";
import CourseSchedule from "./courses.course.schedule.component";
import {useNeeds} from "../_helpers/needs";
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


export default function Course({currentCourseId, setNewCourse, addCourseId, newCourse, deleteCourse}) {
  const loading = currentCourseId === null;

  const errorHandler = useErrorHandler();

  const [course, setCourse] = useState(null);  // todo rename to student
const [hasNeeds, NEEDS] = useNeeds();
  useEffect(() => {
    if (loading) return setCourse(null);
    CoursesDataService
            .getOne(currentCourseId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setCourse(res["data"]);
                });
  }, [currentCourseId])

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   useEffect(()=>{
    setValue(0);
  }, [currentCourseId])

  const handleChangeIndex = (index) => {
    setValue(index);
  };

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
                  <Tab label={t("course")} {...a11yProps(0)} />
                   { !newCourse &&
                  <Tab label={t("labels")} {...a11yProps(1)} />}

                    { !newCourse && hasNeeds([NEEDS.schedules]) &&
                  <Tab label={t("schedules")} {...a11yProps(2)} />}

                   { !newCourse && hasNeeds([NEEDS.students]) &&
                  <Tab label={t("students")} {...a11yProps(3)} />}

                   { !newCourse && hasNeeds([NEEDS.teachers]) &&
                  <Tab label={t("teachers")} {...a11yProps(4)} />}

                   { !newCourse && hasNeeds([NEEDS.rooms]) &&
                  <Tab label={t("rooms")} {...a11yProps(5)} />}

                </Tabs>
              </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            containerStyle={{height: '100%'}}
            className={classes.content}
            onChangeIndex={handleChangeIndex}
          >

            <TabFrame value={value} index={0}>  <CourseDetails
                    newCourse={newCourse}
                    setNewCourse={setNewCourse}
                    dir={theme.direction}
                    currentCourse={course}
                    updateCurrentCourse={setCourse}
                    deleteCourse={deleteCourse}
            /></TabFrame>

         <TabFrame value={value} index={1}>     <CourseLabels
                      dir={theme.direction}
                      currentCourse={course}
                      updateCurrentCourse={setCourse}
                      deleteCourse={deleteCourse}
         /></TabFrame>

              {hasNeeds([NEEDS.schedules]) && <TabFrame value={value} index={2}>
                  <CourseSchedule
                        setScheduleIds={(ids) => setCourse({...course, schedules: ids})}
                       className={classes.tab}
                       dir={theme.direction}
                       scheduleIds={course === null ? null : course.schedules}
                       student_id={currentCourseId}
              /></TabFrame>}

              {hasNeeds([NEEDS.students]) &&

            <TabFrame value={value} index={3}>  <AddDeleteSubresource
                  defaultSearchBy="full_name"
                  parentItemDataService={CourseStudentsDataService}
                  itemDataService={StudentsDataService}
                  add_message_confirm="confirm_enroll_to_course"
                  parent_id={currentCourseId}
                  searchByOptions={["full_name"]}
                  withFiltersBox={true}
                  resourceName={"students"}
                  displayNameField={"full_name"}
                  usableFilters={[{
                    name: 'enrolment_status',
                    defaultValue: null,
                    options: [
                        {
                            label: "enrolled",
                            tooltip: "only_enrolled",
                            name: 'enrolled'
                        }, {
                            label: "pre-enrolled",
                            tooltip: "only_preenrolled",
                            name: 'pre-enrolled'
                        }, {
                            label: "early-unenrolled",
                            tooltip: "only_earlyunenrolled",
                            name: 'early-unenrolled'
                        }
                    ]
                },
                    {
                      name: 'default_payment_method',
                        defaultValue: null,
                        options: [
                           {label: "cash", tooltip: "only_cash", name: 'cash'},
                           {label: "card", tooltip: "only_card", name: 'card'},
                                {label: "bank-transfer", tooltip: "only_banktransfer", name: 'bank-transfer'},
                                {
                                    label: "bank-direct-debit",
                                    tooltip: "only_bankdirectdebit",
                                    name: 'bank-direct-debit'
                                }
                        ]
                    }]}
                  auxFields={["enrolment_status"]}
                  displayText={(student) => student['full_name'] + (student['enrolment_status'] === 'enrolled'? ' ☑️': '')}
                  add_message="enroll_to_course"
                  onSubresourceAdded={(id) => {
                    setCourse({
                                       ...course,
                                       students: [...course['students'], id]
                                   })
                  }}
                  onSubresourceDeleted={(id) => {
                    setCourse({
                           ...course,
                           students: course['students'].filter((s) => s !== id)
                       });
                  }}
            /></TabFrame>



              }

              {hasNeeds([NEEDS.teachers]) &&

                 <TabFrame value={value} index={4}>  <AddDeleteSubresource
                  defaultSearchBy="full_name"
                  parentItemDataService={CourseTeachersDataService}
                  itemDataService={TeachersDataService}
                  add_message_confirm="confirm_add_to_course"
                  parent_id={currentCourseId}
                  searchByOptions={["full_name"]}
                  resourceName={"teachers"}
                  displayNameField={"full_name"}
                  add_message="add_teacher"
                  onSubresourceAdded={(id) => {
                    setCourse({
                                       ...course,
                                       teachers: [...course['teachers'], id]
                                   })
                  }}
                  onSubresourceDeleted={(id) => {
                    setCourse({
                           ...course,
                           teachers: course['teachers'].filter((c) => c !== id)
                       });
                  }}
                 /></TabFrame>

              }

               {hasNeeds([NEEDS.rooms]) &&

                 <TabFrame value={value} index={5}>  <AddDeleteSubresource
                  defaultSearchBy="name"
                  parentItemDataService={CourseRoomsDataService}
                  itemDataService={RoomsDataService}
                  add_message_confirm="confirm_link_to_room"
                  parent_id={currentCourseId}
                  searchByOptions={["name"]}
                  resourceName={"rooms"}
                  displayNameField={"name"}
                  add_message="link_room"
                  onSubresourceAdded={(id) => {
                    setCourse({
                                       ...course,
                                       rooms: [...course['rooms'], id]
                                   })
                  }}
                  onSubresourceDeleted={(id) => {
                    setCourse({
                           ...course,
                           rooms: course['rooms'].filter((c) => c !== id)
                       });
                  }}
                 /></TabFrame>

              }


          </SwipeableViews>

    </Paper>
  );
}
