import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React from "react";
import CoursesDataService from "../_services/courses.service";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import * as yup from 'yup';
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import DirtyTextField from "./dirtytextfield.component";
import {useNormik} from "../_helpers/normik";
import SaveButton from "./formik_save_button";
import DiscardButton from "./formik_discard_button";
import Divider from "@material-ui/core/Divider";
import {DialogContent, MenuItem, TextField} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import GetAppIcon from "@material-ui/icons/GetApp";
import StudentsDataService from "../_services/students.service";
import Typography from "@material-ui/core/Typography";
import {useSnackbar} from "notistack";
import {useFormik} from "formik";
import {DEFAULT_COURSE_PRICE_TERM} from "../_data/price_term";
import {useNeeds} from "../_helpers/needs";
import {loadingContext} from "../_context/loading-context";
import {confirmContext} from "../_context/confirm-context";
import { useHistory } from "react-router-dom";
import {downloadCalendar} from "../_services/calendar.service";
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';

const useStyles = makeStyles((theme) => ({
  actionIcon: {
    float: 'right'
  },
    textField: {
    marginRight: theme.spacing(1),
    width: 200,
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
    },
    choose: {
      marginBottom: theme.spacing(3)
    }
}));

function CourseDetails({ children, addCourseId, setNewCourse, newCourse, currentCourse, updateCurrentCourse, patchService, deleteCourse, ...other }) {
  const { t } = useTranslation();
  let history = useHistory();
  const loading = currentCourse === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const deleteFullCourse = (id_) => {
    CoursesDataService
              .delete(id_)
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                deleteCourse(id_);
              });
  }

  const [openDownloadAttendanceList, setOpenDownloadAttendanceList] = React.useState(false);

const confirm = React.useContext(confirmContext);

  let initialValues = loading ? {} : currentCourse;
  if (newCourse) {
      initialValues = {
          price_term: DEFAULT_COURSE_PRICE_TERM,
          is_published: false
      }
  }

    const formik2 = useFormik({
        initialValues: {},
        validationSchema: yup.object({
            startDate: yup.date().required(t("required")),
             endDate: yup.date().required(t("required")),
        }),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {


            setSubmitting(true);
            setStatus();

             CoursesDataService
                    .downloadSubresource(currentCourse["id"], 'attendance-list/v1', values)
                    .then(...errorHandler({snackbarSuccess: true}))
                    .then(() => {
                        setOpenDownloadAttendanceList(false);
                    })
                 .catch(() => {
                     setStatus(true);
                 })
                 .finally(() => {
                     setSubmitting(false);
                 })


        }
    });

    const downloadAttendances = () => {
      CoursesDataService
          .downloadSubresource(currentCourse["id"], 'attendance-list/v2')
          .then(...errorHandler({snackbarSuccess: true}));
    }

    const formik = useNormik(!newCourse, {
        initialValues: initialValues,
        validationSchema: yup.object({
            name: yup.string().required(t("name_required")),
        }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0) {
                setStatus();

                if (newCourse) {
                    CoursesDataService.post(changedValues)
                         .then(...errorHandler({snackbarSuccess: true}))
                    .then(function (new_id) {
                        updateCurrentCourse(new_id);
                        setNewCourse(false);
                    }).catch(function (err) {
                    setStatus(true);
                    }).finally(() => {
                    setSubmitting(false);
                });
                } else {
                   CoursesDataService.patch({
                    id: initialValues["id"],
                    body: changedValues,
                    initial_values: initialValues
                }).then(...errorHandler({snackbarSuccess: true}))
                    .then(function (patched_body) {
                        formik.resetForm(patched_body);
                        updateCurrentCourse(patched_body);
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
     const loadingCtx = React.useContext(loadingContext);
const [hasNeeds, NEEDS] = useNeeds();
  return (
    <div
      {...other}
    >


         <Dialog
        open={openDownloadAttendanceList}
        onClose={(e) => {setOpenDownloadAttendanceList(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      ><form onSubmit={formik2.handleSubmit}>
        <DialogTitle id="alert-dialog-title">{t("download")}</DialogTitle>
            <DialogContent>
                <Typography className={classes.choose}>{t("chose_list_dates")}</Typography>

                <TextField
                    id="date"
                    label={t("start")}
                    type="date"
                    value={formik2.values["startDate"]}
                    name={"startDate"}
                    onChange={formik2.handleChange}
                    onBlur={formik2.handleBlur}
                    error={formik2.status  || formik2.errors["startDate"] !== undefined}
                    helperText={formik2.touched["startDate"] && formik2.errors["startDate"]}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <TextField
                    id="date"
                    label={t("end")}
                    type="date"
                    value={formik2.values["endDate"]}
                    name={"endDate"}
                    onChange={formik2.handleChange}
                    error={formik2.status  || formik2.errors["endDate"] !== undefined}
                    helperText={formik2.touched["endDate"] && formik2.errors["endDate"]}
                    onBlur={formik2.handleBlur}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
            </DialogContent>
        <DialogActions>
          <Button onClick={(e) => {
            setOpenDownloadAttendanceList(false);
          }} color="primary">
            {t("cancel")}
          </Button>
          <Button type="submit" color="primary"   disabled={formik2.isSubmitting} autoFocus>
            {t("download")}
          </Button>
        </DialogActions></form>
      </Dialog>


        <Box p={3}>
            <Box px={2}>

              {!newCourse && loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
               hasNeeds([NEEDS.delete]) && <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                    if (newCourse) {
                        setNewCourse(false);
                    } else{
                        confirm.confirm("delete_course_question", "not_undone", () => {
                            deleteFullCourse(currentCourse['id']);
                        })
                    }

                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }

              {!newCourse && loading?
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
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                           <DirtyTextField
                                label={t("description")}
                                style={{flex: 1}}
                                multiline
                                rowsMax={8}
                                name="description"
                                formik={formik}
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("price_term")}
                                style={{flex: 1}}
                                name="price_term"
                                formik={formik}
                                type="number"
                            />
                            <DirtyTextField
                                label={t("public")}
                                style={{flex: 1}}
                                name="is_published"
                                formik={formik}
                                select
                            >
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                        </Box>

                    </form>


                )



            }

             {!loading && !newCourse && <Box my={3}>
            <Divider />
            </Box>}


            <Box className={[classes.line, classes.composite]}>
                {!loading && !newCourse &&
                <Tooltip style={{flex: 1}} title={t("take attendance")} aria-label={t("take_attendance")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<AssignmentTurnedInIcon/>}
                      onClick={(e) => {
                        history.replace(`/attendance?id=${currentCourse['id']}`)
                      }}
                  >
                    {t("take attendance")}
                  </Button>
                </Tooltip>}
              </Box>

            <Box className={[classes.line, classes.composite]}>
                {!loading && hasNeeds([NEEDS.students]) &&  !newCourse &&
                <Tooltip style={{flex: 1}} title={t("export_attendance_list")} aria-label={t("export_attendance_list")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                        setOpenDownloadAttendanceList(true);
                      }}
                  >
                    {t("attendance_list")}
                  </Button>
                </Tooltip>}

                {!loading && hasNeeds([NEEDS.students]) &&  !newCourse &&
                <Tooltip style={{flex: 1}} title={t("export_attendance_list")} aria-label={t("export_attendance_list")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      onClick={downloadAttendances}
                  >
                    {t("export_attendance_list") + ` (${t("v2")})`}
                  </Button>
                </Tooltip>}

                
              </Box>


                <Box className={[classes.line, classes.composite]}>
                {!loading && !newCourse &&
                <Tooltip style={{flex: 1}} title={t("export_calendar")} aria-label={t("send_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                        downloadCalendar("courses", currentCourse['id'], currentCourse['calendar_id']).then(r => {});
                      }}
                  >
                    {t("export_calendar")}
                  </Button>
                </Tooltip>}

                {!loading && hasNeeds([NEEDS.students, NEEDS.guardians]) && !newCourse &&
                <Tooltip style={{flex: 1}} title={t("export_students_contact_sheet")} aria-label={t("export_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      disabled={loadingCtx.loading}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                          loadingCtx.startLoading();
                        CoursesDataService
                            .downloadSubresource(currentCourse["id"], 'contactsSheet')
                            .then(...errorHandler({snackbarSuccess: true}))
                            .finally(() => {
                                loadingCtx.stopLoading();
                            })
                      }}
                  >
                    {t("students_contact_sheet")}
                  </Button>
                </Tooltip>}
              </Box>




            </Box>
        </Box>
    </div>
  );
}

export default CourseDetails;