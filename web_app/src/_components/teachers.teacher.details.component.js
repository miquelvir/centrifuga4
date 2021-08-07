import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React from "react";
import TeachersDataService from "../_services/teachers.service";
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
import Divider from "@material-ui/core/Divider";
import {useNeeds} from "../_helpers/needs";
import {safe_email_required} from "../_yup/validators";
import {confirmContext} from "../_context/confirm-context";
import Button from "@material-ui/core/Button";
import GetAppIcon from "@material-ui/icons/GetApp";
import {downloadCalendar} from "../_services/calendar.service";


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

function TeacherDetails({ children, addStudentId, setNewRoom, newRoom, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
   const deleteFullStudent = () => {
    TeachersDataService
              .delete(currentStudent['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                deleteStudent(currentStudent['id']);
              });
  }


const confirm = React.useContext(confirmContext);
  let initialValues = loading ? {} : currentStudent;


    const formik = useNormik(!newRoom, {
        initialValues: initialValues,
        validationSchema: yup.object({
            email: safe_email_required(t),  // todo
            name: yup.string().required(t("name_required")),
        }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0) {
                setStatus();

                if (newRoom) {
                    TeachersDataService.post(changedValues)
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
                   TeachersDataService.patch({
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
    });
const [hasNeeds, NEEDS] = useNeeds();
  return (
        <Box p={3}>
            <Box px={2}>

              {!newRoom && loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
              hasNeeds([NEEDS.delete]) &&  <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                    if (newRoom) {
                        setNewRoom(false);
                    } else{
                        confirm.confirm("delete_teacher", "not_undone", () => {
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

                        <DirtyTextField
                            label={t("calendar_url")}
                            name="calendar_url"
                            disabled
                            className={classes.line}
                            formik={formik}
                            />

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("name")}
                                style={{flex: 1}}
                                name="name"
                                formik={formik}
                            />
                            <DirtyTextField
                                label={t("surname1")}
                                style={{flex: 1}}
                                name="surname1"
                                formik={formik}
                            />
                            <DirtyTextField
                                label={t("surname2")}
                                style={{flex: 1}}
                                formik={formik}
                                name="surname2"
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("email")}
                                type="email"
                                style={{flex: 1}}
                                formik={formik}
                                name="email"
                                helperText={formik.touched["email"] && formik.errors["email"]}
                            />
                        </Box>

                       <Box my={3}>
            <Divider />
            </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("address")}
                                formik={formik}
                                style={{flex: 4}}
                                name="address"
                            />
                            <DirtyTextField
                                label={t("city")}
                                style={{flex: 2}}
                                formik={formik}
                                name="city"
                            />
                            <DirtyTextField
                                label={t("zip")}
                                formik={formik}
                                type="number"
                                style={{flex: 1}}
                                name="zip"
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("dni")}
                                style={{flex: 1}}
                                formik={formik}
                                name="dni"
                            />
                            <DirtyTextField
                                label={t("phone")}
                                type="tel"
                                style={{flex: 1}}
                                formik={formik}
                                name="phone"
                            />



                        </Box>

                         {!loading && !newRoom && <Box my={3}>
            <Divider />
            </Box>}

                        <Box className={[classes.line, classes.composite]}>
                {!loading && !newRoom &&
                <Tooltip style={{flex: 1}} title={t("export_calendar")} aria-label={t("send_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                        downloadCalendar("teachers", currentStudent['id'], currentStudent['calendar_id']).then(r => {});
                      }}
                  >
                    {t("export_calendar")}
                  </Button>
                </Tooltip>}
              </Box>


                    </form>
                )

            }

            </Box>
        </Box>
  );
}

export default TeacherDetails;