import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students-list.component";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  contentPanel: {
    height: "80vh", //TODO
    boxSizing: "border-box"
  }
}));

export default function Students() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <Grid container spacing={3} className={classes.grid}>
        <Grid item xs={4}>
          <h1>{t("students")}</h1>
          <StudentsList/>
        </Grid>

        <Grid item xs={8}>
          <Paper elevation={3} square className={classes.contentPanel}>
            <h1>mama</h1>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}
