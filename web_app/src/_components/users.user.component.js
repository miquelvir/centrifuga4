import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import UsersDataService from "../_services/users.service";
import {useErrorHandler} from "../_helpers/handle-response";
import UserPerson from "./users.user.userperson.component";
import UserPermissions from "./users.user.permissions.component";
import * as PropTypes from "prop-types";
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



export default function User({currentUserId, deleteUser}) {
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
                  <Tab label={t("permissions")} {...a11yProps(1)} />
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
            <UserPerson
                      dir={theme.direction}
                      currentStudent={user}
                      updateCurrentStudent={setUser}
                      deleteStudent={deleteUser}
            /></TabFrame>
<TabFrame value={value} index={1}>
            <UserPermissions
                      dir={theme.direction}
                      currentStudent={user}
                      updateCurrentStudent={setUser}
                      deleteStudent={deleteUser}
            /></TabFrame>

          </SwipeableViews>

    </Paper>
  );
}
