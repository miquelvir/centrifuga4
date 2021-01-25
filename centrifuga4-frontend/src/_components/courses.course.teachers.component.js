import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import TeachersDataService from "../_services/teachers.service"
import {useErrorHandler} from "../_helpers/handle-response";
import {Skeleton} from "@material-ui/lab";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {
    AppBar,
    Dialog,
    ListItemSecondaryAction,
    Slide
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import SearchBar from "./searchbar.component";
import Pagination from "@material-ui/lab/Pagination";
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import {useNeeds} from "../_helpers/needs";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const useStyles = makeStyles((theme) => ({
  list: {
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    box: {
        display: "flex",
        flexDirection: "column",
    },
    pagination: {
        margin: '30px'
    },
    appBar: {
    position: 'relative',
  },
  newLine: {
    width: '100%',
       marginTop: theme.spacing(1),
        display: "flex",
    flexDirection: "column"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  }, actionIcon: {
      float: 'right'
    }
}));

class CloseIcon extends React.Component {
    render() {
        return null;
    }
}

function CourseTeachers({ children, history, value, dataService, index, title, courseIds, deleteCourseFromStudent, addCourseId, student_id, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const loading = courseIds === null;
const [hasNeeds, NEEDS] = useNeeds();
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState(null);
  const [newCourse, setNewCourse] = useState(false);
  const handleClose = () => {
    setNewCourse(false);
  };

  useEffect(()=>{
    setNewCourse(false);
  }, [courses])


   const [searchTerm, setSearchTerm] = useState('');
   const [page, setPage] = useState(1);
   const [count, setCount] = useState(0);

   function search() {
       if (loading || !newCourse) return;

        TeachersDataService
            .getAll({name: 'name', value: searchTerm}, page, ['name', 'description', 'id'])
            .then(...errorHandler({}))
            .then(res => {
                setAllCourses(res["data"].filter(x => !(courseIds.includes(x['id']))));
                setCount(res["_pagination"]["totalPages"]);
            });
    }

    useEffect(search, [page, setAllCourses, loading, newCourse]);

   const handlePageChange = (event, value) => {
        setPage(value);
    };

  const deleteStudentCourse = (id) => {
    dataService
        .delete(student_id, id)
        .then(...errorHandler({snackbarSuccess:true}))
        .then(function (r) {
             deleteCourseFromStudent(id);
        });
  }

  useEffect(() => {
    if (courseIds === null) return;

    if (courseIds.length === 0){
      setCourses([]);
    } else {
      TeachersDataService
            .getMany(courseIds)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setCourses(res.map(res => res["data"]));
                });
    }
  }, [courseIds])
const onChangeSearchTerm = (e) => {
        setSearchTerm(e.target.value);
    };
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>  {// todo simplify everywhere
        } <Box px={2}>

            <Dialog fullScreen open={newCourse} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar} color="secondary">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
                {t("enroll_to_course")}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
                {t("cancel")}
            </Button>
          </Toolbar>
        </AppBar>
        <Box className={classes.box} m={3}>
                <SearchBar
                    label={t("courses")}
                    value={searchTerm}
                    onChange={onChangeSearchTerm}
                    onSearch={search}
                />

                <Box my={2}>
                    <Pagination
                        className={classes.pagination}
                        count={count}
                        page={page}
                        size="small"
                        showFirstButton
                        showLastButton
                        siblingCount={1}
                        boundaryCount={1}
                        color="primary"
                        onChange={handlePageChange}
                    />
                </Box>
            <List className={classes.list}>
                {allCourses && allCourses.map((course) => (
                    <div key={course["id"]}>
                        <ListItem key={course["id"]} button
                                  onClick={() => {
                                      if (window.confirm(t("confirm_enroll_to_course"))){  // todo
                                        dataService
                                            .postWithId(student_id, course['id'])
                                            .then(...errorHandler({snackbarSuccess: true}))
                                            .then((body) => {
                                                addCourseId(course['id']);
                                                handleClose();
                                            })
                                      }
                                  }}>

                            <ListItemText id="name" primary={course['name']} secondary={course['description']}/>

                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>
            </Box>

      </Dialog>

              {loading?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
             hasNeeds([NEEDS.post]) && <Tooltip className={classes.actionIcon} title={t("add_teacher")} aria-label={t("new_payment")}>
                <IconButton onClick={(e) => {
                    if (allCourses === null) {
                        search();
                    }
                    setNewCourse(true);
                }}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
              }

              <div className={classes.newLine}>

                  <List className={classes.list}>
                {courses && courses.map((course) => (
                    <div key={course["id"]}>
                        <ListItem key={course["id"]} button onClick={(e) => {
                            history.push('/courses?id='+course['id']);
                        }}>
                            <ListItemText id="name" primary={course.name} secondary={course.description}/>
                            {hasNeeds([NEEDS.delete]) && <ListItemSecondaryAction>
                                <IconButton onClick={(e) => {
                                    if (window.confirm(t("confirm_unenroll_to_course"))) deleteStudentCourse(course['id'])
                                }}>
                                    <DeleteIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>}
                        </ListItem>
                        <Divider/>
                    </div>
                ))}
            </List>



              {loading &&
                <Skeleton width="100%" height="250px"/>  // todo we can do better
              }

              {!loading && courses.length === 0 && !newCourse &&
                <Typography>{t("no_teachers")}</Typography>
              }
              </div>
            </Box>
        </Box>
      )}
    </div>
  );
}

export default CourseTeachers;
