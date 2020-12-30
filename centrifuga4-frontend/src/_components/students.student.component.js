import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import Attendee from "./students.student.attendee.component";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
  },

  contentPanel: {
    flex: 1,
    overflow: "auto",
    boxSizing: "border-box"
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
  const currentStudent = props.currentStudent;
  const setCurrentStudent = props.setCurrentStudent;

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  console.log(">>", currentStudent);

  let contacts = [1,2];

  return (
    <Paper elevation={3} square className={classes.contentPanel}>
            <AppBar position="static" color="default">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label={t("attendee")} {...a11yProps(0)} />
                  {
                  contacts && contacts.map((contact, index) => (
                  <Tab label={t("contact ") + (index+1)} {...a11yProps(index)} />
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
                      title="attendee"
                      currentStudent={currentStudent}/>
            {
              contacts && contacts.map((contact, index) => (
                   <Attendee value={value} index={index+1} dir={theme.direction} title={"contact " + (index + 1)}/>
                  ))}

            }
          </SwipeableViews>
          </Paper>
  );
}
