import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import Attendee from "./students.student.attendee.component";
import Guardian from "./students.student.guardian.component";
import StudentsDataService from "../_services/students.service";
import Payments from "./students.student.payments.component";
import {useErrorHandler} from "../_helpers/handle-response";
import Schedule from "./students.student.schedule.component";
import StudentsCourseDataService from "../_services/student_courses.service";
import CoursesDataService from "../_services/courses.service";
import {useNeeds} from "../_helpers/needs";
import AddDeleteSubresource from "./subresource_add_delete.component";
import TabFrame, {a11yProps} from "./tab";
import SchedulesDataService from "../_services/schedules.service";
import Scheduler, {eventFromSchedule} from "./scheduler.component";

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




export default function Student({setNewStudent,newStudent,addStudentId, currentStudentId, deleteStudent, ...props}) {

  const loading = currentStudentId === null;

  const errorHandler = useErrorHandler();

  const [student, setStudent] = useState(null);  // todo rename to student
  const [newGuardian, setNewGuardian] = useState(false);
    const [hasNeeds, NEEDS] = useNeeds();


  useEffect(() => {
    if (loading) return setStudent(null);
    StudentsDataService
            .getOne(currentStudentId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setStudent(res["data"]);
                });
  }, [currentStudentId])

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   useEffect(()=>{
    setValue(0);
  }, [currentStudentId])

  const handleChangeIndex = (index) => {
    setValue(index);
  };



  const guardians = student === null? []: student.guardians;
    // todo maybe tabs with or only with icons
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
                  <Tab label={t("attendee")} {...a11yProps(0)} />

                    { !newStudent && hasNeeds([NEEDS.schedules]) &&
                  <Tab label={t("schedules")} {...a11yProps(1)} />}
                 { !newStudent  && hasNeeds([NEEDS.payments]) &&  <Tab label={t("payments")} {...a11yProps(2)} />}
                 { !newStudent  && hasNeeds([NEEDS.courses]) &&  <Tab label={t("courses")} {...a11yProps(3)} />}

                  {
                  (!newStudent && guardians  && hasNeeds([NEEDS.guardians]) ) && guardians.map((contact, index) => (
                  <Tab key={t("contact") + " " + (index+1)} label={t("contact") + " " + (index+1)} {...a11yProps(index+4)} />
                      ))}


                  {
                    (!newStudent && newGuardian) &&
                        <Tab key={t("new_guardian")} label={t("new_guardian")} {...a11yProps(4+guardians.length)} />
                  }


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
                <Attendee
                      setNewStudent={setNewStudent}
                      dir={theme.direction}
                      newStudent={newStudent}
                      title={t("attendee")}
                      currentStudent={student}
                      addStudentId={addStudentId}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setStudent}
                      deleteStudent={deleteStudent}
                      addNewGuardian={() => {
                        setNewGuardian(true);
                        setValue(4+guardians.length);
                      }}/>
            </TabFrame>

              {hasNeeds([NEEDS.schedules]) && <TabFrame value={value} index={1}>
              <Scheduler
                    allowDelete={(s) => !s.is_base}
                    allowView={true}
                    viewUrl={(s) => ['/courses', s.course_id]}
                    setScheduleIds={(ids) => setStudent({...student, schedules: ids})}
                    onEventChange={(info, day_week, start_time, end_time, schedule) => {
                       const newEvent = info.event;
                       let body = {};
                        body['day_week'] = day_week;
                        body['start_time'] = start_time;
                        body['end_time'] = end_time;

                        if (schedule["is_base"]) {
                            body['course_id'] = schedule["course_id"];
                            body['student_id'] = currentStudentId;
                            SchedulesDataService
                                    .post(body)
                                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                                    .then(function (res) {
                                        let calendarApi = info.view.calendar;
                                        newEvent['is_base'] = false;  // todo needed?
                                        calendarApi.addEvent(eventFromSchedule(theme, res));
                                        info.revert();
                                        setStudent({...student, schedules: [...student.schedules, res.id]})
                                    }).catch(function(err){
                                        info.revert();
                            });

                        } else {
                            SchedulesDataService
                                    .patch({id: schedule['id'],
                                                                body: body,
                                                                initial_values: schedule})
                                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                                    .then(function (res) {
                                    }).catch(function (err){
                                        info.revert();
                                    });
                        }
                    }}
                    scheduleIds={student === null ? null : student['schedules']}
                    editable={true}
                    selectable={false}
                />

              </TabFrame>}
              {hasNeeds([NEEDS.payments]) && <TabFrame value={value} index={2}>
                  <Payments
                         paymentIds={student === null ? null : student.payments}
                         addPaymentId={(payment_id) => {
                             setStudent({...student, payments: [...student.payments, payment_id]})
                         }}
                         student_id={currentStudentId}
                         deletePaymentFromStudent={(payment_id) => {
                             setStudent({
                                 ...student,
                                 payments: student.payments.filter((p) => p !== payment_id)
                             });
                         }}
              /></TabFrame>}

              {hasNeeds([NEEDS.courses]) &&

             <TabFrame value={value} index={3}> <AddDeleteSubresource
                  defaultSearchBy="name"
                  parentItemDataService={StudentsCourseDataService}
                  itemDataService={CoursesDataService}
                  add_message_confirm="confirm_enroll_to_course"
                  parent_id={currentStudentId}
                  secondaryDisplayNameField="description"
                  searchByOptions={["name"]}
                  resourceName={"courses"}
                  displayNameField={"name"}
                  add_message="enroll_to_course"
                  onSubresourceAdded={(id) => {
                    setStudent({...student, courses: [...student["courses"], id]})
                  }}
                  onSubresourceDeleted={(id) => {
                    setStudent({...student, courses: student["courses"].filter(x => x !== id)});
                  }}
             /></TabFrame>
              }

            {
              guardians && hasNeeds([NEEDS.guardians]) && guardians.map((guardian, index) => (
                  <TabFrame value={value} index={index+4}>
                      <Guardian
                            key={guardian}
                            dir={theme.direction}
                            guardianId={guardian}
                            deleteGuardianId={(id) => {
                              setStudent({...student, guardians: student['guardians'].filter((gId) => gId !== id)});
                              setValue(0);
                            }}
                  /></TabFrame>
                  ))}

                  <TabFrame value={value} index={4+guardians.length}>
                      <Guardian
                        dir={theme.direction}
                        newGuardian={true}
                        deleteNewGuardian={() => {
                            setNewGuardian(false);
                            setValue(0);
                        }}
                            studentId={currentStudentId}
                        addGuardianId={(id) => {
                            setNewGuardian(false);
                            setStudent({...student, guardians: [...student.guardians, id]});
                            setValue(4+guardians.length);
                        }
                        }
                        deleteGuardianId={(id) => {
                            setStudent({...student, guardians: student['guardians'].filter((gId) => gId !== id)});
                            setValue(0);
                        }}
                  /></TabFrame>

          </SwipeableViews>

    </Paper>
  );
}
