import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import {IconButtonSkeleton} from "../_skeletons/iconButton"
import CourseLabelsDataService from "../_services/course_labels.service";
import {useErrorHandler} from "../_helpers/handle-response";
import {useNormik} from "../_helpers/normik";
import SaveButton from "./formik_save_button";
import DiscardButton from "./formik_discard_button";
import LabelsSelection from "./labels_selection.component";
import {symmetricDifference} from "../_helpers/set_operations";

const useStyles = makeStyles((theme) => ({
  actionIcon: {
    float: 'right'
  },
  button: {
    margin: theme.spacing(1),
  },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    }
}));

function CourseLabels({ value, index, currentCourse, updateCurrentCourse, patchService, deleteCourse, ...other }) {
  const { t } = useTranslation();
  const loading = currentCourse === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();

  let initialValues = loading ? {} : currentCourse;


    const formik = useNormik(false, {
        initialValues: initialValues,
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
               setStatus();

               const a = new Set(values["labels"]);
               const b = new Set(initialValues["labels"]);
               const difference = Array.from(symmetricDifference(a, b));

               if (difference.size !== 0){
                   setSubmitting(true);
                   const jobs = difference.map(need => {
                    if (b.has(need)){
                       // has been removed
                        return CourseLabelsDataService.delete(currentCourse['id'], need)
                          .then(...errorHandler({}));
                   } else {
                        // has been added
                        return CourseLabelsDataService.postWithId(currentCourse['id'], need)
                          .then(...errorHandler({}));
                    }
                });
                   Promise
                       .all(jobs)
                       .then(...errorHandler({snackbarSuccess: true}))
                       .then(() => {
                           updateCurrentCourse({...currentCourse, labels: values["labels"]});
                       })
                       .finally(() => {
                           setSubmitting(false);
                       })
               }




        }
    }, true);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >

      {value === index && (
        <Box p={3}>
            <Box px={2}>

              {loading?
                (

                    <Box>
                         <IconButtonSkeleton className={classes.actionIcon}/>
                       <IconButtonSkeleton className={classes.actionIcon}/>


                            <div style={{clear: 'both'}}>
                               <Box py={0} >
                                        <Skeleton variant="text" width={value} height="150px"/>
                                    </Box>
                            </div>
                    </Box>
                )
                :
                (
                    <form onSubmit={formik.handleSubmit}>

                        <DiscardButton className={classes.actionIcon}
                                        formik={formik}/>


                        <SaveButton className={classes.actionIcon}
                                    formik={formik}/>

                                    <Box style={{display: "inline-block"}}>
                        <LabelsSelection
                formik={formik}
            /></Box>

                    </form>
                )

            }

            </Box>
        </Box>
      )}
    </div>
  );
}

export default CourseLabels;