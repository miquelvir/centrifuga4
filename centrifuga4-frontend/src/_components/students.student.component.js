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
import GuardiansDataService from "../_services/guardians.service";
import Payments from "./students.student.payments.component";
import {useErrorHandler} from "../_helpers/handle-response";
import AddIcon from "@material-ui/icons/Add";
import Fab from "@material-ui/core/Fab";
import Zoom from "@material-ui/core/Zoom";
import Tooltip from "@material-ui/core/Tooltip";
import Skeleton from "@material-ui/lab/Skeleton";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,

  },
    fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: theme.palette.primary.main
  }, fab_placeholder: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  },
  contentPanel: {
    //flex: 1,
      position: 'relative', // todo proper scrollbar AND fab
    overflow: "auto",
    boxSizing: "border-box",
      height: '100%', // todo proper,
    minHeight: 200,

  },
  fullWidth: {
    width: "100%"
  },
  sizeSmall: {
    margin: theme.spacing(1),
    width: "25ch"
  },
  sizeLong: {
    margin: theme.spacing(1),
    width: "100%"
  }
}));




function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function Student(props) {
  const currentStudentId = props.currentStudentId;
  const deleteStudent = props.deleteStudent;
  const loading = currentStudentId === null;

  const errorHandler = useErrorHandler();

  const [student, setStudent] = useState(null);  // todo rename to student
  const [newGuardian, setNewGuardian] = useState(false);

  const addPaymentId = (payment_id) => {
    setStudent({...student, payments: [...student.payments, payment_id]})
  }

  useEffect(() => {
    if (currentStudentId === null) return setStudent(null);
    console.log(currentStudentId);
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

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
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
                  scrollButtons="auto"
                  aria-label="full width tabs example"
                >
                  <Tab label={t("attendee")} {...a11yProps(0)} />
                  <Tab label={t("schedule")} {...a11yProps(1)} />
                  <Tab label={t("payments")} {...a11yProps(2)} />

                  {
                  guardians && guardians.map((contact, index) => (
                  <Tab key={t("contact") + " " + (index+1)} label={t("contact") + " " + (index+1)} {...a11yProps(index+3)} />
                      ))}


                  {
                    newGuardian &&
                        <Tab key={t("new_guardian")} label={t("new_guardian")} {...a11yProps(3+guardians.length)} />
                  }



                </Tabs>
              </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            onChangeIndex={handleChangeIndex}
          >
            <Attendee value={value}
                      index={0}
                      dir={theme.direction}
                      title={t("attendee")}
                      currentStudent={student}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setStudent}
                      deleteStudent={deleteStudent}
                      addNewGuardian={() => {
                        setNewGuardian(true);
                        setValue(3+guardians.length);
                      }}
            />
            <Attendee value={value}
                      index={1}
                      dir={theme.direction}
                      title={t("attendee")}
                      currentStudent={student}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setStudent}
                      deleteStudent={deleteStudent}
            />
            <Payments value={value}
                      index={2}
                      paymentIds={student === null? null: student.payments}
                      key={student}
                      addPaymentId={addPaymentId}
                      student_id={currentStudentId}
                      deletePaymentFromStudent={(payment_id) => {
                        setStudent({...student,
                            payments: student.payments.filter((p) => p !== payment_id)});
                      }}
            />


            {
              guardians && guardians.map((guardian, index) => (
                  <Guardian value={value}
                            index={index+3}
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
                        index={3+guardians.length}
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
                            setValue(3+guardians.length);
                        }
                        }
                        deleteGuardianId={(id) => {
                            setStudent({...student, guardians: student['guardians'].filter((gId) => gId !== id)});
                            setValue(0);
                        }}
              />

            }
          </SwipeableViews>

    </Paper>
  );
}
