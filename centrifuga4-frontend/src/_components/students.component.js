import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students.list.component";
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

  const [currentStudentId, setCurrentStudentId] = useState(null);

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <h1>{t("students")}</h1>
          <StudentsList
            setCurrentStudent={setCurrentStudentId}/>
        </Grid>

        <Grid item xs={8}>
          <Student
            currentStudentId={currentStudentId}
          />
        </Grid>
      </Grid>
    </div>
  );
}
