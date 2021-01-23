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
import UsersDataService from "../_services/users.service";
import Payments from "./students.student.payments.component";
import Courses from "./students.student.courses.component";
import {useErrorHandler} from "../_helpers/handle-response";
import Schedule from "./students.student.schedule.component";
import UserPerson from "./users.user.userperson.component";

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


export default function User(props) {
  const currentUserId = props.currentStudentId;
  const deleteUser = props.deleteStudent;
  const loading = currentUserId === null;

  const errorHandler = useErrorHandler();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (loading) return setUser(null);
    UsersDataService
            .getOne(currentUserId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setUser(res["data"]);
                });
  }, [currentUserId])

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   useEffect(()=>{
    setValue(0);
  }, [currentUserId])

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
                  <Tab label={t("user")} {...a11yProps(0)} />
                </Tabs>
              </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            containerStyle={{height: '100%'}}
            className={classes.content}
            onChangeIndex={handleChangeIndex}
          >
            <UserPerson value={value}
                      index={0}
                      dir={theme.direction}
                      title={t("attendee")}
                      currentStudent={user}
                      updateCurrentStudent={setUser}
                      deleteStudent={deleteUser}
            />

          </SwipeableViews>

    </Paper>
  );
}
