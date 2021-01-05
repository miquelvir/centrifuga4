import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students.list.component";
import Student from "./students.student.component";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  }
}));


export default function Students() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [students, setStudents] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("students")}</h1>
          <StudentsList
            setCurrentStudentId={setCurrentStudentId}
            currentStudentId={currentStudentId}
            students={students}
            setStudents={setStudents}
          />
        </Grid>

        <Grid item xs={8} className={classes.right}>
          <Student
            currentStudentId={currentStudentId}
            deleteStudent={(studentId) => {
                console.log(studentId, currentStudentId);
                if (studentId === currentStudentId) {
                    console.log("to null");
                    setCurrentStudentId(null);
                }
                setStudents(students.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
