import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students.list.component";
import Student from "./students.student.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Tooltip} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
      position: 'relative',

  },fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));


export default function Students({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentStudentId(id);
  }, [id])

  useEffect(() => {
      if (currentStudentId !== null) setNewStudent(false);
  }, [currentStudentId])

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
          <Tooltip title={t("new_student")}>
              <Fab className={classes.fab} color="primary" onClick={(e) => {
                  setCurrentStudentId(null);
                 setNewStudent(true);
              }}>
                <AddIcon />
              </Fab>
          </Tooltip>
        </Grid>

        <Grid item xs={8} className={classes.right}>
          <Student
            currentStudentId={currentStudentId}
            newStudent={newStudent}
            history={history}
            addStudentId={(id) =>{
                setCurrentStudentId(id);
            }}
            deleteStudent={(studentId) => {
                if (studentId === currentStudentId) setCurrentStudentId(null);

                setStudents(students.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
