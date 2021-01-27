import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Student from "./students.student.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Tooltip} from "@material-ui/core";
import CoursesDataService from "../_services/courses.service";
import ItemsList from "./items_list.component";
import Course from "./courses.course.component";
import {useNeeds} from "../_helpers/needs";
import ItemsListMain from "./items_list_main.component";

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


export default function Courses({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentCourseId(id);
  }, [id])

  useEffect(() => {
      if (currentCourseId !== null) setNewCourse(false);
  }, [currentCourseId])
const [hasNeeds, NEEDS] = useNeeds();
  return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("courses")}</h1>
            <ItemsListMain
                setCurrentItemId={setCurrentCourseId}
                currentItemId={currentCourseId}
                items={courses}
                setItems={setCourses}
                usableFilters={[{
                    name: 'is_published',
                    defaultValue: null,
                    options: [
                        {
                            label: "published",
                            tooltip: "only_published",
                            name: true
                        }, {
                            label: "private",
                            tooltip: "only_private",
                            name: false
                        }
                    ]
                }]}
                defaultSearchBy="name"
                searchByOptions={["name", "id"]}
                dataService={CoursesDataService}
                searchBarLabel="courses"
                displayNameField="name"
            />


            {hasNeeds([NEEDS.post]) && <Tooltip title={t("new_student")}>
                <Fab className={classes.fab} color="primary" onClick={(e) => {
                    setCurrentCourseId(null);
                    setNewCourse(true);
                }}>
                    <AddIcon/>
                </Fab>
            </Tooltip>}
        </Grid>

        <Grid item xs={8} className={classes.left}>
          <Course
            currentCourseId={currentCourseId}
            newCourse={newCourse}
            setNewCourse={setNewCourse}
            history={history}
            addCourseId={(id) =>{
                setCurrentCourseId(id);
            }}
            deleteCourse={(studentId) => {
                if (studentId === currentCourseId) setCurrentCourseId(null);

                setCourses(courses.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
