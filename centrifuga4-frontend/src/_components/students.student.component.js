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
import Courses from "./students.student.courses.component";
import {useErrorHandler} from "../_helpers/handle-response";
import Schedule from "./students.student.schedule.component";
import StudentsCourseDataService from "../_services/student_courses.service";
import {useNeeds} from "../_helpers/needs";

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


function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


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
            <Attendee value={value}
                      index={0}
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
                      }}
            />

              {hasNeeds([NEEDS.schedules]) && <Schedule value={value}
                         index={1}
                         className={classes.tab}
                         dir={theme.direction}
                         title={t("attendee")}
                         scheduleIds={student === null ? null : student['schedules']}
                         student_id={currentStudentId}
              />}
              {hasNeeds([NEEDS.payments]) && <Payments value={value}
                         index={2}
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
              />}

              {hasNeeds([NEEDS.courses]) && <Courses value={value}
                        index={3}
                        dataService={StudentsCourseDataService}
                        history={props.history}
                        courseIds={student === null ? null : student['courses']}
                        addCourseId={(course_id) => {
                            setStudent({
                                ...student,
                                courses: [...student['courses'], course_id]
                            })
                        }}
                        student_id={currentStudentId}
                        deleteCourseFromStudent={(course_id) => {
                            setStudent({
                                ...student,
                                courses: student['courses'].filter((c) => c !== course_id)
                            });
                        }}
              />
              }

            {
              guardians && hasNeeds([NEEDS.guardians]) && guardians.map((guardian, index) => (
                  <Guardian value={value}
                            index={index+4}
                            key={guardian}
                            dir={theme.direction}
                            guardianId={guardian}
                            deleteGuardianId={(id) => {
                              setStudent({...student, guardians: student['guardians'].filter((gId) => gId !== id)});
                              setValue(0);
                            }}
            />
                  ))}

                  <Guardian value={value}
                        index={4+guardians.length}
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
              />

          </SwipeableViews>

    </Paper>
  );
}
