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
  const loading = currentStudentId === null;

  const errorHandler = useErrorHandler();

  const [student, setStudent] = useState(null);  // todo rename to student

  const [newPayment, setNewPayment] = useState(0);

  const addPaymentId = (payment_id) => {
    setStudent({...student, payments: [...student.payments, payment_id]})
  }

  useEffect(() => {
    if (currentStudentId === null) return;
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
            />
            <Attendee value={value}
                      index={1}
                      dir={theme.direction}
                      title={t("attendee")}
                      currentStudent={student}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setStudent}
            />
            <Payments value={value}
                      index={2}
                      paymentIds={student === null? null: student.payments}
                      key={student}
                      addPaymentId={addPaymentId}
                      student_id={currentStudentId}
                      newPayment={newPayment}
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
                            title={t("contact") + " " + (index + 1)}
                            guardianId={guardian}
                            patchService={GuardiansDataService}
            />
                  ))}

            }
          </SwipeableViews>
      {// use skeletons when loading
         }

        {value === 0?
            loading? <Skeleton variant="circle" className={classes.fab_placeholder}><Fab/> </Skeleton>:
               <Zoom
                  in={value === 0}
                  timeout={transitionDuration}
                  style={{
                    transitionDelay: `${value === 0 ? transitionDuration.exit : 0}ms`,
                  }}
                  unmountOnExit
                >
                  <Tooltip title={t("new_guardian")}>
                 <Fab className={classes.fab} onClick={() => null}>
                  <AddIcon/>
                 </Fab></Tooltip>
               </Zoom>
            : null
        }

        {value === 2?
            loading? <Skeleton variant="circle" className={classes.fab_placeholder}><Fab/> </Skeleton>:
               <Zoom
                  in={value === 2}
                  timeout={transitionDuration}
                  style={{
                    transitionDelay: `${value === 2 ? transitionDuration.exit : 0}ms`,
                  }}
                  unmountOnExit
                >
                  <Tooltip title={t("new_payment")}>
                 <Fab className={classes.fab} onClick={() => setNewPayment(newPayment+1)}>
                  <AddIcon/>
                 </Fab></Tooltip>
               </Zoom>
            : null
        }

    </Paper>
  );
}
