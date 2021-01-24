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


const useStyles = makeStyles((theme) => ({
  actionIcon: {
    float: 'right'
  },
    textField: {
    marginLeft: theme.spacing(1),
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
    }
}));

function CourseDetails({ children, addCourseId, setNewCourse, newCourse, value, index, currentCourse, updateCurrentCourse, patchService, deleteCourse, ...other }) {
  const { t } = useTranslation();
  const loading = currentCourse === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState(false);
  const deleteFullStudent = () => {
    CoursesDataService
              .delete(currentCourse['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                deleteCourse(currentCourse['id']);
              });
  }

  const [openDownloadAttendanceList, setOpenDownloadAttendanceList] = React.useState(false);

const {enqueueSnackbar, closeSnackbar} = useSnackbar();

  let initialValues = loading ? {} : currentCourse;

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
                    .downloadSubresource(currentCourse["id"], 'attendanceList', values)
                    .then(...errorHandler({snackbarSuccess: true}))
                    .then(() => {
                        setOpenConfirmDeleteDialog(false);
                    })
                 .catch(() => {
                     setStatus(true);
                 })
                 .finally(() => {
                     setSubmitting(false);
                 })


        }
    });

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

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      <Dialog
        open={openConfirmDeleteDialog}
        onClose={(e) => {setOpenConfirmDeleteDialog(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t("delete_room_question")}</DialogTitle>
        <DialogActions>
          <Button onClick={(e) => {
            setOpenConfirmDeleteDialog(false);
          }} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={(e) => {
              deleteFullStudent(currentCourse['id']);

            setOpenConfirmDeleteDialog(false);
          }} color="primary" autoFocus>
            {t("delete_room")}
          </Button>
        </DialogActions>
      </Dialog>


         <Dialog
        open={openDownloadAttendanceList}
        onClose={(e) => {setOpenDownloadAttendanceList(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      ><form onSubmit={formik2.handleSubmit}>
        <DialogTitle id="alert-dialog-title">{t("download")}</DialogTitle>
            <DialogContent>
                <Typography>{t("chose_list_dates")}</Typography>

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

      {value === index && (
        <Box p={3}>
            <Box px={2}>

              {!newCourse && loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
               <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                    if (newCourse) {
                        setNewCourse(false);
                    } else{
                        setOpenConfirmDeleteDialog(true);
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
                               {   ["100%", "100%", "100%"].map((value, idx) => {
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
                <Tooltip style={{flex: 1}} title={t("export_attendance_list")} aria-label={t("send_grant_letter")}>
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

                {!loading && !newCourse &&
                <Tooltip style={{flex: 1}} title={t("export_students_contact_sheet")} aria-label={t("export_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                        CoursesDataService
                            .downloadSubresource(currentCourse["id"], 'contactsSheet')
                            .then(...errorHandler({snackbarSuccess: true}))
                            .then(() => null)
                      }}
                  >
                    {t("students_contact_sheet")}
                  </Button>
                </Tooltip>}
              </Box>

            </Box>
        </Box>
      )}
    </div>
  );
}

export default CourseDetails;