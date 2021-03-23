import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Fab from "@material-ui/core/Fab";
import {
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, MenuItem,
    TextField,
    Tooltip
} from "@material-ui/core";
import CourseStudentsDataService from "../_services/course_students.service";
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import dataService from "../_services/courses.service";
import * as yup from "yup";
import {useFormik} from "formik";
import {bulkEmailService} from "../_services/bulkEmail.service";
import {useErrorHandler} from "../_helpers/handle-response";
import {safe_email_required} from "../_yup/validators";
import EmailTo from "./emailTo.component";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import SaveIcon from '@material-ui/icons/Save';
import DirtyTextField from "./dirtytextfield.component";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import List from "@material-ui/core/List";
import {CloudDownload} from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
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
    position: 'absolute',
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

  const [groups, setGroups] = useState([]);
  const [hasAttended, setHasAttended] = useState([]);
  const [hasAttendedInitial, setHasAttendedInitial] = useState([]);
  const [students, setStudents] = useState(null);
   const [pristine, setPristine] = useState(true);
    const [courseId, setCourseId] = useState(null);

    useEffect(() => {
        setPristine(areArraysEqualSets(hasAttended, hasAttendedInitial));
    }, [hasAttendedInitial, hasAttended])
    useEffect(() => {
        if (courseId === null) return;
        setHasAttended([]);
        setHasAttendedInitial([]);
        CourseStudentsDataService
            .getAll(null, '*', ["full_name", "id"], null, courseId)
            .then(...errorHandler({}))
            .then(function (res) {
                setStudents(res["data"]);
            });
    }, [courseId]);
  const errorHandler = useErrorHandler();
    const today = new Date().toISOString().split("T")[0];
  const formik = useFormik({
        initialValues: {start: today},
        validationSchema: yup.object({}),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setSubmitting(true);

        }
    });
  useEffect(() => {
      dataService
            .getAll(null, "*", ['id', "name"])
            .then(...errorHandler({}))
            .then(function (res) {
                setGroups(res["data"]);
            });
  }, [])

    const handleToggle = (id) => {
        if (hasAttended.includes(id)) return setHasAttended(hasAttended.filter(x => x !== id));
        setHasAttended([...hasAttended, id]);
    }

  return (
      <div>
          <h1>{t("attendance")}</h1>
          <EmailTo
            formik={formik}
            style={{width: "100%"}}
            options={groups}
            addTo={x => {setCourseId(x.id)}}
            name={"course_id"}
            label={t("courses")}
        />
        <Box className={[classes.line, classes.composite]}>
            <DirtyTextField
                label={t("date")}
                type="date"
                style={{flex: 1}}
                noDirty={true}
                name="start"
                formik={formik}
                InputLabelProps={{shrink: true}}/>
                <IconButton onClick={(e) => formik.submitForm()}>
            <SearchIcon />
          </IconButton>
        </Box>
          {students && <List className={classes.root}>
              <ListItem key={"all"} role={undefined} dense button onClick={() => {
                  if (hasAttended.length === students.length) {
                      setHasAttended([]);
                  } else {
                      setHasAttended(students.map(x => x.id));
                  }
              }}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={hasAttended.length === students.length}
                tabIndex={-1}
                disableRipple
                color={"primary"}
                inputProps={{ 'aria-labelledby': "all" }}
              />
            </ListItemIcon>
            <ListItemText id={"all"} primary={t("mark_all")} />
          </ListItem>

             <Divider />


      {students.map((student) => {
        const labelId = `checkbox-list-label-${student.id}`;

        return (
          <ListItem key={student.id} role={undefined} dense button onClick={() => handleToggle(student.id)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={hasAttended.includes(student.id)}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': labelId }}
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={student["full_name"]} />
          </ListItem>
        );
      })}
    </List>}
          <div className={classes.fabs}>
              <Tooltip title={t("download")}>
                <Fab className={classes.fab} color="secondary" onClick={() => {}} disabled={formik.isSubmitting}>
                    <CloudDownload/>
                </Fab>
            </Tooltip>
              <Tooltip title={t("reset")}>
                <Fab className={classes.fab} color="secondary" onClick={() => {}} disabled={formik.isSubmitting || pristine}>
                    <CloseIcon/>
                </Fab>
            </Tooltip>
           <Tooltip title={t("save")}>
                <Fab className={classes.fab} color="primary" onClick={() => {}} disabled={formik.isSubmitting || pristine}>
                    <SaveIcon/>
                </Fab>
            </Tooltip>
          </div>

      </div>
  );
}
