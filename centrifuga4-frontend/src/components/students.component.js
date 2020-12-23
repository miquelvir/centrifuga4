import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students.list.component";
import Box from "@material-ui/core/Box";
import {FilledInput, FormControl, InputAdornment, MenuItem, TextField} from "@material-ui/core";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import Typography from "@material-ui/core/Typography";
import countryList from "../data/countries";
import Attendee from "./students.student.attendee.component";
import Student from "./students.student.component";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
  }
}));


export default function Students() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [currentStudent, setCurrentStudent] = useState(null);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <h1>{t("students")}</h1>
          <StudentsList
            setCurrentStudent={setCurrentStudent}/>
        </Grid>

        <Grid item xs={8}>
          <Student
            currentStudent={currentStudent}
            setCurrentStudent={setCurrentStudent}
          />
        </Grid>
      </Grid>
    </div>
  );
}
