import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {MenuItem, TextField} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import StudentsDataService from "../_services/students.service";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import * as yup from 'yup';
import {IconButtonSkeleton} from "../_skeletons/iconButton"
import Person from "./students.student.person.component";
import InputAdornment from "@material-ui/core/InputAdornment";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import UsersDataService from "../_services/users.service";
import Dialog from "@material-ui/core/Dialog";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import DirtyTextField from "./dirtytextfield.component";
import SendIcon from "@material-ui/icons/Send";
import {sendEnrollmentEmail} from "../_services/emailsEnrollment.service";
import ReceiptIcon from "@material-ui/icons/Receipt";
import Divider from "@material-ui/core/Divider";
import {sendGrantEmail} from "../_services/emailsGrants.service";
import GetAppIcon from "@material-ui/icons/GetApp";
import {payment_methods} from "../_data/payment_methods";
import {emptyAttendee, emptyGuardian} from "../_data/empty_objects";
import {useNormik} from "../_helpers/normik";
import RestoreIcon from "@material-ui/icons/Restore";
import SaveIcon from "@material-ui/icons/Save";
import DirtyCountrySelect from "./contry-select.component";
import {education_years} from "../_data/education";


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

function UserPerson({ children, addStudentId, value, index, newStudent, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState(false);
  const deleteFullStudent = () => {
    UsersDataService
              .delete(currentStudent['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                deleteStudent(currentStudent['id']);
              });
  }


  let initialValues = loading ? {} : currentStudent;


    const formik = useNormik(true, {
        initialValues: initialValues,
        validationSchema: yup.object({
            email: yup.string().email(t("invalid_email")),  // todo
            name: yup.string().required(t("name_required")),
        }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {

                if (Object.keys(changedValues).length > 0) {
                setStatus();
                UsersDataService.patch({
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
        <DialogTitle id="alert-dialog-title">{t("delete_user_question")}</DialogTitle>
        <DialogActions>
          <Button onClick={(e) => {
            setOpenConfirmDeleteDialog(false);
          }} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={(e) => {
            deleteFullStudent(currentStudent['id']);
            setOpenConfirmDeleteDialog(false);
          }} color="primary" autoFocus>
            {t("delete_user")}
          </Button>
        </DialogActions>
      </Dialog>

      {value === index && (
        <Box p={3}>
            <Box px={2}>

              {loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
               <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                  setOpenConfirmDeleteDialog(true);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }

              {loading?
                (

                    <Box>
                         <IconButtonSkeleton className={classes.actionIcon}/>
                       <IconButtonSkeleton className={classes.actionIcon}/>


                            <div style={{clear: 'both'}}>
                               {   ["100%", "100%", "100%", "100%", "100%", "100%"].map((value, idx) => {
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


                        <IconButton className={classes.actionIcon}
                                     onClick={formik.handleReset}
                                     disabled={!formik.dirty || formik.isSubmitting}>
                            <Tooltip title={t("reset")} aria-label={t("reset")}>
                                <RestoreIcon/>
                            </Tooltip>
                        </IconButton>


                        <IconButton className={classes.actionIcon} type="submit"
                                    disabled={!formik.dirty || formik.isSubmitting}>
                            <Tooltip title={t("save")} aria-label={t("save")}>
                                <SaveIcon/>
                            </Tooltip>
                        </IconButton>


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

                    </form>
                )

            }



              {
                // todo user permissions as in dialog
              }
            </Box>
        </Box>
      )}
    </div>
  );
}

export default UserPerson;