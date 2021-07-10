import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React from "react";
import RoomsDataService from "../_services/rooms.service";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import * as yup from 'yup';
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import DirtyTextField from "./dirtytextfield.component";
import {useNormik} from "../_helpers/normik";
import SaveButton from "./formik_save_button";
import DiscardButton from "./formik_discard_button";
import {useNeeds} from "../_helpers/needs";
import {safe_email_required} from "../_yup/validators";
import {confirmContext} from "../_context/confirm-context";


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

function RoomDetails({ children, addStudentId, setNewRoom, newRoom, newStudent, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();

const confirm = React.useContext(confirmContext);
  const deleteFullStudent = () => {
    RoomsDataService
              .delete(currentStudent['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                deleteStudent(currentStudent['id']);
              });
  }


  let initialValues = loading ? {} : currentStudent;


    const formik = useNormik(!newRoom, {
        initialValues: initialValues,
        validationSchema: yup.object({
            name: yup.string().required(t("name_required")),
        }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0) {
                setStatus();

                if (newRoom) {
                    RoomsDataService.post(changedValues)
                         .then(...errorHandler({snackbarSuccess: true}))
                    .then(function (new_id) {
                        updateCurrentStudent(new_id);
                        setNewRoom(false);
                    }).catch(function (err) {
                    setStatus(true);
                    }).finally(() => {
                    setSubmitting(false);
                });
                } else {
                   RoomsDataService.patch({
                    id: initialValues["id"],
                    body: changedValues,
                    initial_values: initialValues
                }).then(...errorHandler({snackbarSuccess: true}))
                    .then(function (patched_body) {
                        formik.resetForm(patched_body);
                        updateCurrentStudent(patched_body);
                    }).catch(function (err) {
                        setStatus(true);
                    }).finally(() => {
                        setSubmitting(false);
                    });
                }




            } else {
                setSubmitting(false);
            }
        }
    });const [hasNeeds, NEEDS] = useNeeds();

  return (

        <Box p={3}>
            <Box px={2}>

              {!newRoom && loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              : hasNeeds([NEEDS.delete]) &&
               <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                    if (newRoom) {
                        setNewRoom(false);
                    } else{
                        confirm.confirm("delete_room_question", "not_undone", () => {
                            deleteFullStudent();
                        })
                    }

                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }

              {!newRoom && loading?
                (

                    <Box>
                         <IconButtonSkeleton className={classes.actionIcon}/>
                       <IconButtonSkeleton className={classes.actionIcon}/>


                            <div style={{clear: 'both'}}>
                               {   ["100%", "100%", "100%", "100%"].map((value, idx) => {
                                return (
                                    <Box key={idx} py={0} >
                                        <Skeleton variant="text" width={value} height="60px"/>
                                    </Box>);
                            })}
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



                        <DirtyTextField
                            label={t("id")}
                            name="id"
                            disabled
                            className={classes.line}
                            formik={formik}
                        />

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("name")}
                                style={{flex: 4}}
                                name="name"
                                formik={formik}
                            />
                            <DirtyTextField
                                label={t("capacity")}
                                style={{flex: 1}}
                                name="capacity"
                                formik={formik}
                                type="number"
                            />
                        </Box>

                    </form>
                )

            }

            </Box>
        </Box>
  );
}

export default RoomDetails;