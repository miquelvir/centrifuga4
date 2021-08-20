import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import Fab from "@material-ui/core/Fab";
import {Checkbox, ListItem, ListItemIcon, Button, ListItemText, Tooltip} from "@material-ui/core";
import CourseStudentsDataService from "../../_services/course_students.service";
import {attendanceService} from "../../_services/course_attendance.service"
import CloseIcon from '@material-ui/icons/Close';
import dataService from "../../_services/courses.service";
import * as yup from "yup";
import {useFormik} from "formik";
import {useErrorHandler} from "../../_helpers/handle-response";
import EmailTo from "../../_components/emailTo.component";
import Box from "@material-ui/core/Box";
import SaveIcon from '@material-ui/icons/Save';
import DirtyTextField from "../../_components/dirtytextfield.component";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from "@material-ui/core/List";
import {STATUS_ATTENDANCE, STATUS_ABSENT, STATUS_ABSENT_JUSTIFIED} from './status';
import AttendanceItem from './attendance.component.item';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import EventBusyIcon from '@material-ui/icons/EventBusy';
import CommentDialog from './commentDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    [theme.breakpoints.down('sm')]: {paddingBottom: '100px'}
  },
    textBox: {
      width: "100%",
        border: "red"
    },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    },
    chip: {
      margin: theme.spacing(0.5)
    },
    chips: {
      marginBottom: theme.spacing(1)
    },
    in: {
      marginBottom: theme.spacing(1)
    },fabs: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },fab: {
    marginLeft: theme.spacing(2),
  }
}));

function areArraysEqualSets(a1, a2) {
  const superSet = {};
  for (const i of a1) {
    const e = i + typeof i;
    superSet[e] = 1;
  }

  for (const i of a2) {
    const e = i + typeof i;
    if (!superSet[e]) {
      return false;
    }
    superSet[e] = 2;
  }

  for (let e in superSet) {
    if (superSet[e] === 1) {
      return false;
    }
  }

  return true;
}


export default function Attendance({...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const id = new URLSearchParams(window.location.search).get('id');

  const [initialAttendances, setInitialAttendances] = useState(null);
  const [attendances, setAttendances] = useState(null);
  const resetAttendances = () => setAttendances(createEmptyAttendances(students, initialAttendances, date));


  const getAddedStudentIds = () => {
    const studentsInInitial = Object.keys(initialAttendances);
    return Object.keys(attendances).filter(studentId => !studentsInInitial.includes(studentId) && 
    (attendances[studentId]['status'] !== null || attendances[studentId]['comment'] !== null))
  }

  const hasNewAttendances = () => {
    const addedStudentIds = getAddedStudentIds();
    if (addedStudentIds.length === 0) return false;
    return true;
  }

  const getNewAttendances = () => {
    const addedStudentIds = getAddedStudentIds();
    if (addedStudentIds.length === 0) return null;

    const filtered = Object.keys(attendances)
      .filter(key => addedStudentIds.includes(key))
      .reduce((obj, key) => {
        obj[key] = attendances[key];
        return obj;
      }, {});
    return filtered;
  }

  const hasChanges = (initial, updated) => {
    if (initial['student_id'] !== updated['student_id']) throw new Error("student id has changed");
    if (initial['course_id'] !== updated['course_id']) throw new Error("course id has changed");
    if (initial['date'] !== updated['date']) return true;
    if (initial['comment'] !== updated['comment']) return true;
    if (initial['status'] !== updated['status']) return true;
    return false;
  }

  const hasChangesGlobal = () => {
    if (initialAttendances === null) return false;
    if (attendances === null) return false;
    if (hasNewAttendances()) return true;
    if (hasUpdatedAttendances()) return true;
    return false;
  }

  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDirty(hasChangesGlobal());
  }, [initialAttendances, attendances]);

  const getChangedFields = (initial, updated) => {
    if (!hasChanges(initial, updated)) return null;

    let result = {};
    if (initial['date'] !== updated['date']) {
      result['date'] = updated['date'];
    }
    if (initial['comment'] !== updated['comment']){
      result['comment'] = updated['comment'];
    }
    if (initial['status'] !== updated['status']){
      result['status'] = updated['status'];
    }
    return result;
  }

  const hasUpdatedAttendances = () => Object.keys(initialAttendances).some(key => 
    hasChanges(initialAttendances[key], attendances[key]));

  const getUpdatedAttendances = () => {
    const filtered = Object.keys(initialAttendances)
      .reduce((obj, key) => {
        const dirtyFields = getChangedFields(initialAttendances[key], attendances[key]);
        if (dirtyFields !== null) obj[key] = dirtyFields;
        return obj;
      }, {});
    return filtered;
  }

  const [students, setStudents] = useState(null);
  const [courseId, setCourseId] = useState(id);
  const [allDone, setAllDone] = useState(true);
  const [date, setDate] = useState(null);

  useEffect(() => {
    if (attendances === null) return;
    const allDone = !Object.keys(attendances).some(studentId => attendances[studentId]['status'] !== STATUS_ATTENDANCE);
    setAllDone(allDone);
  }, [attendances]);

    const createEmptyAttendances = (students, attendances, date) => {
      if (attendances === null) return;
      if (students === null) return;
      
      const newAttendances = {...attendances};

      students.forEach(student => {
        const id = student['id'];
        if (attendances[id] === undefined) {
          newAttendances[id] = {
            status: null,
            comment: null,
            course_id: courseId,
            student_id: id,
            date: date
          };
        } 
      });
      return newAttendances;
    }

    const loadAttendances = () => {
      if (courseId === null) return;
      if (formik.values["start"] === '') return;
      if (students === null) return;
      
      attendanceService
        .get(courseId, formik.values["start"])
        .then(...errorHandler({}))
        .then(function (res) {
          const newAttendances = res["data"][0]["data"].reduce((a,x) => ({...a, [x['student_id']]: x}), {});
          setInitialAttendances(newAttendances);
          setDate(res["data"][0]["date"]);
          setAttendances(createEmptyAttendances(students, newAttendances, date));
          
        });
    }

    useEffect(() => {
        if (courseId === null) return;
        CourseStudentsDataService
            .getAll(null, '*', ["full_name", "id"], {enrolment_status: "enrolled"}, courseId)
            .then(...errorHandler({}))
            .then(function (res) {
                setStudents(res["data"]);
            });
    }, [courseId]);

    
  const errorHandler = useErrorHandler();
  const today = new Date().toISOString().split("T")[0];

const formik = useFormik({
      initialValues: {start: today, course_id: id},
      validationSchema: yup.object({}),
      enableReinitialize: true,
      onSubmit: (values, {setStatus, setSubmitting}) => {
          setSubmitting(true);
      }
  });

  useEffect(loadAttendances, [formik.values["start"], courseId, students]);

  const markAll = (targetStatus) => {
    const newAttendances = {...attendances};
    Object.keys(newAttendances).map(function(studentId, index) {
      newAttendances[studentId]['status'] = targetStatus;
    });
    setAttendances(newAttendances);
  }

  const setAttendance = (studentId, attendance) => {
    const newAttendances = {...attendances};
    newAttendances[studentId] = attendance;
    setAttendances(newAttendances);
  }

  const [commentBox, setCommentBox] = useState(false);
  const handleCloseCancelCommentBox = () => {
    setCommentBox(false);
  }
  const handleCloseCommentBox = () => {
    handleCloseCancelCommentBox();
    setAttendance(commentBoxId, {...attendances[commentBoxId], comment: commentBoxValue});
  }
  const handleOpenCommentBox = (studentId) => {
    setCommentBoxValue(attendances[studentId]['comment']);
    setCommentBox(true);
    setCommentBoxId(studentId);
  }
  const [commentBoxValue, setCommentBoxValue] = useState(null);
  const [commentBoxId, setCommentBoxId] = useState(null);

  

  return (
      <div>
        <CommentDialog 
          commentBox={commentBox}
          handleCloseCommentBox={handleCloseCommentBox}
          commentBoxValue={commentBoxValue}
          handleCloseCancelCommentBox={handleCloseCancelCommentBox}
          setCommentBoxValue={setCommentBoxValue}
          />
         
          {false && <EmailTo
            formik={formik}
            style={{width: "100%"}}
            options={[]}
            addTo={x => {setCourseId(x.id)}}
            name={"course_id"}
            label={t("courses")}
        />}
        <Box p={2}>
          <h1>{t("attendance")}</h1>
          <Box className={[classes.line, classes.composite]}>
            
              <DirtyTextField
                  label={t("date")}
                  type="date"
                  style={{flex: 1}}
                  noDirty={true}
                  name="start"
                  formik={formik}
                  InputLabelProps={{shrink: true}}/>
          </Box>
        </Box>
        
          {students && <List className={classes.root}>
            
      {attendances && students && students.map((student) => <AttendanceItem
        student={student}
        setAttendance={(x) => setAttendance(student['id'], x)}
        handleOpenCommentBox={() => handleOpenCommentBox(student['id'])}
        attendance={attendances[student['id']] ?? null} 
      />)}
    </List>}
          <div className={classes.fabs}>
          <Tooltip title={t("mark-all")}>
                <Fab className={classes.fab} color="secondary" onClick={() => {
                    markAll(allDone? STATUS_ABSENT: STATUS_ATTENDANCE);
                  }} disabled={formik.isSubmitting}>
                    {allDone? <EventBusyIcon/>: <EventAvailableIcon/>}
                </Fab>
            </Tooltip>
              <Tooltip title={t("reset")}>
                <Fab className={classes.fab} color="secondary" onClick={resetAttendances} disabled={formik.isSubmitting || !dirty}>
                    <CloseIcon/>
                </Fab>
            </Tooltip>
           <Tooltip title={t("save")}>
                <Fab className={classes.fab} color="primary" onClick={() => {
                        /*attendanceService
                            .put(courseId, formik.values["start"], hasAttended)
                            .then(...errorHandler({}))
                            .then(function (res) {
                                setHasAttendedInitial(hasAttended);
                            });*/
                }} disabled={formik.isSubmitting || !dirty}>
                    <SaveIcon/>
                </Fab>
            </Tooltip>
          </div>

      </div>
  );
}
