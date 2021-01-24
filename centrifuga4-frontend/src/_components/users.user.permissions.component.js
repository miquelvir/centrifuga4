import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import {IconButtonSkeleton} from "../_skeletons/iconButton"
import UsersNeedsDataService from "../_services/user_needs.service";
import {useErrorHandler} from "../_helpers/handle-response";
import {useNormik} from "../_helpers/normik";
import NeedsSelection from "./needs_selection.component";
import SaveButton from "./formik_save_button";
import DiscardButton from "./formik_discard_button";
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

function UserPerson({ children, addStudentId, value, index, newStudent, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();

  let initialValues = loading ? {} : currentStudent;


    const formik = useNormik(false, {
        initialValues: initialValues,
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
               setStatus();

               const a = new Set(values["needs"]);
               const b = new Set(initialValues["needs"]);
               const difference = Array.from(symmetricDifference(a, b));

               if (difference.size !== 0){
                   setSubmitting(true);
                   const jobs = difference.map(need => {
                    if (b.has(need)){
                       // has been removed
                        return UsersNeedsDataService.delete(currentStudent['id'], need)
                          .then(...errorHandler({}));
                   } else {
                        // has been added
                        return UsersNeedsDataService.postWithId(currentStudent['id'], need)
                          .then(...errorHandler({}));
                    }
                });
                   Promise
                       .all(jobs)
                       .then(...errorHandler({snackbarSuccess: true}))
                       .then(() => {
                           updateCurrentStudent({...currentStudent, needs: values["needs"]});
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
                        <NeedsSelection
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

export default UserPerson;