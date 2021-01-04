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

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1
  },
  contentPanel: {
    //flex: 1,
    overflow: "auto",
    boxSizing: "border-box",
      height: '80vh', // todo proper,
      position: 'relative', // todo proper scrollbar AND fab
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

  const errorHandler = useErrorHandler();

  const [currentStudent, setCurrentStudent] = useState(null);  // todo rename to student

  useEffect(() => {
      console.log("id changed");
    if (currentStudentId === null) return;
    StudentsDataService
            .getOne(currentStudentId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setCurrentStudent(res["data"]);
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

  const guardians = currentStudent === null? []: currentStudent.guardians;
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
                      currentStudent={currentStudent}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setCurrentStudent}
            />
            <Attendee value={value}
                      index={1}
                      dir={theme.direction}
                      title={t("attendee")}
                      currentStudent={currentStudent}
                      patchService={StudentsDataService}
                      updateCurrentStudent={setCurrentStudent}
            />
            <Payments value={value}
                      index={2}
                      paymentIds={currentStudent === null? []: currentStudent.payments}
                      key={currentStudent}
                      deletePaymentFromStudent={(payment_id) => {
                        setCurrentStudent({...currentStudent,
                            payments: currentStudent.payments.filter((p) => p !== payment_id)});
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
    </Paper>
  );
}
