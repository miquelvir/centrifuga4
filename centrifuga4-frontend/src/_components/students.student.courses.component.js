import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import StudentsCourseDataService from "../_services/student_courses.service";
import CoursesDataService from "../_services/courses.service";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
    AppBar,
    Dialog,
    Slide
} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import {useNeeds} from "../_helpers/needs";
import ItemsListSecondary from "./items_list_secondary.component";
import ItemsListTerciary from "./items_list_terciary.component";

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

function Courses({ children, history, value, dataService, index, title, courseIds, deleteCourseFromStudent, addCourseId, student_id, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const loading = courseIds === null;

  const [newCourse, setNewCourse] = useState(false);
  const handleClose = () => {
    setNewCourse(false);
  };

   const [hasNeeds, NEEDS] = useNeeds();

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
            <ItemsListTerciary
                    dataService={CoursesDataService}
                    dataServiceSR={StudentsCourseDataService}
                    defaultSearchBy="name"
                    searchByOptions={["name", "id"]}
                    searchBarLabel="courses"
                    displayNameField="name"
                    secondaryDisplayNameField="description"
                    parent_id={student_id}
                    add_message={"confirm_enroll_to_course"}
                    onAdded={(id) => {
                        addCourseId(id);
                        setNewCourse(false);
                    }}
                />
            </Box>
          </Dialog>

              {loading?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
              hasNeeds([NEEDS.post]) && <Tooltip className={classes.actionIcon} title={t("enroll_to_course")} aria-label={t("new_payment")}>
                <IconButton onClick={(e) => {
                    setNewCourse(true);
                }}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
              }


              <div className={classes.newLine}>
                <ItemsListSecondary
                    dataService={StudentsCourseDataService}
                    defaultSearchBy="name"
                    searchByOptions={["name", "id"]}
                    searchBarLabel="courses"
                    displayNameField="name"
                    parent_id={student_id}
                    deleteTooltip={"delete"}
                    delete_message={"delete_course_question"}
                    onItemDeleted={(id) => {
                        deleteCourseFromStudent(id);
                    }}
                />
              </div>
            </Box>
        </Box>
      )}
    </div>
  );
}

export default Courses;
