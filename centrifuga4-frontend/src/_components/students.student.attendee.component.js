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
import Person from "./students.student.person.component";
import InputAdornment from "@material-ui/core/InputAdornment";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import GuardiansDataService from "../_services/guardians.service";
import PaymentsDataService from "../_services/payments.service";
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


const useStyles = makeStyles((theme) => ({

  fullWidth: {
    width: "100%"
  },
  button: {
    margin: theme.spacing(1),
  },
  sizeSmall: {
    width: "25ch"
  },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

function Attendee({ children, value, index, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState(false);
  const deleteFullStudent = () => {
    StudentsDataService
              .delete(currentStudent['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                PaymentsDataService
                      .deleteMany(currentStudent['payments'])
                      .then(...errorHandler({}))  // todo everywhere
                      .then(function (res) {

                      });

                GuardiansDataService
                      .deleteMany(currentStudent['guardians'])
                      .then(...errorHandler({}))  // todo everywhere
                      .then(function (res) {

                      });


                // todo schedules, courses


                deleteStudent(currentStudent['id']);
              });
  }
  const sendGrantLetter = () => {
      sendGrantEmail(currentStudent['id'])
          .then(...errorHandler({snackbarSuccess: true}));
  }
  const sendEnrollmentAgreement = () => {
      sendEnrollmentEmail(currentStudent['id'])
          .then(...errorHandler({snackbarSuccess: true}));
  }
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
        <DialogTitle id="alert-dialog-title">{t("delete_student_question")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t("student_also_deletes")}</DialogContentText>
        </DialogContent>
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
            {t("delete_student")}
          </Button>
        </DialogActions>
      </Dialog>

      {value === index && (
        <Box p={3}>
            <Box px={2}>
              {loading?
                  <Skeleton style={{float: 'right'}}><PersonAddIcon/></Skeleton>
              :
              <Tooltip style={{float: 'right'}} title={t("new_guardian")} aria-label={t("new_guardian")}>
                <IconButton onClick={(e) => {
                  addNewGuardian();
                }}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
              }


              {loading?
                  <Skeleton style={{float: 'right'}}><IconButton/></Skeleton>
              :
              <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                  setOpenConfirmDeleteDialog(true);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }



              <Person currentPerson={currentStudent}
                      updateCurrentStudent={updateCurrentStudent}
                      patchService={patchService}
                      onUpdate={(changedBody) => {
                        if ("status" in changedBody && changedBody["status"] === "enrolled"){
                          sendGrantLetter();
                        }
                      }}
                      additionalValidation={{
                        enrollment_status: yup.string().required(t("status_required")),
                        image_agreement: yup.boolean().required(t("image_required"))
                      }}
                      additionalFields={
                        [[<DirtyTextField
                                label={t("price_term")}
                                style={{flex: 1}}
                                name="price_term"
                                type="number"
                                InputProps={{endAdornment: <InputAdornment position="end">€</InputAdornment>,}}
                            />,
                            <DirtyTextField
                                label={t("default_payment_method")}
                                style={{flex: 1}}
                                name="default_payment_method"
                                select>
                                { payment_methods.map(
                                                    (method) => (
                                                        <MenuItem key={method} value={method}>{t(method)}</MenuItem>
                                                    )
                                                )
                                                }
                            </DirtyTextField>],
                            <DirtyTextField
                                label={t("payment_comments")}
                                style={{flex: 1}}
                                multiline
                                rowsMax={8}
                                name="payment_comments"
                            />,
                          [<DirtyTextField
                              label={t("years_in_xamfra")}
                              type="number"
                              style={{flex: 1}}
                              name="years_in_xamfra"/>,
                              <DirtyTextField
                                label={t("status")}
                                style={{flex: 1}}
                                name="enrollment_status"
                                select>
                                {['enrolled', 'early-unenrolled', 'pre-enrolled'].map((s) => (
                                    <MenuItem key={s} value={s}>{t(s)}</MenuItem>
                                ))}
                            </DirtyTextField>,
                              <DirtyTextField
                                label={t("image_agreement")}
                                style={{flex: 1}}
                                name="image_agreement"
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                          ],
                        <DirtyTextField
                                label={t("other_comments")}
                                style={{flex: 1}}
                                multiline
                                rowsMax={8}
                                name="other_comments"
                            />]}
              >

              </Person>

              <Box my={3}>
            <Divider />
            </Box>

              <Box className={[classes.line, classes.composite]}>
                {loading?
                      <Skeleton style={{flex: 1}}><Button/></Skeleton>
                      :
                          <Tooltip style={{flex: 1}} title={t("send_grant_letter")} aria-label={t("send_grant_letter")}>
                           <Button
                          variant="contained"
                          color="default"
                          className={classes.button}
                          startIcon={<SendIcon />}
                          onClick={(e) => {
                               sendGrantLetter();
                            }}
                        >
                          {t("grant_letter")}
                        </Button>
                </Tooltip>
                      }

                {loading? <Skeleton style={{float: 'right'}}><Button/></Skeleton>
                :
                <Tooltip style={{flex: 1}} title={t("export_grant_letter")} aria-label={t("export_grant_letter")}>
            <Button
                          variant="contained"
                          color="default"
                          className={classes.button}
                          startIcon={<GetAppIcon />}
                          onClick={(e) => {
                               StudentsDataService
                    .downloadSubresource(currentStudent["id"], 'grantLetter')
                    .then(...errorHandler({snackbarSuccess:true}))
                    .then(()=>null)
                            }}
                        >
                          {t("grant_letter")}
                        </Button>
          </Tooltip>}
              </Box>

              <Box className={[classes.line, classes.composite]}>
                {loading?
                      <Skeleton style={{flex: 1}}><Button/></Skeleton>
                      :
                          <Tooltip style={{flex: 1}} title={t("send_enrollment_agreement")} aria-label={t("enrollment_agreement")}>
                           <Button
                          variant="contained"
                          color="default"
                          className={classes.button}
                          startIcon={<SendIcon />}
                          onClick={(e) => {
                               sendEnrollmentAgreement();
                            }}
                        >
                          {t("enrollment_agreement")}
                        </Button>
                </Tooltip>
                      }

                {loading? <Skeleton style={{float: 'right'}}><Button/></Skeleton>
                :
                <Tooltip style={{flex: 1}} title={t("export_enrollment_agreement")} aria-label={t("export_enrollment_agreement")}>
            <Button
                          variant="contained"
                          color="default"
                          className={classes.button}
                          startIcon={<GetAppIcon />}
                          onClick={(e) => {
                               StudentsDataService
                    .downloadSubresource(currentStudent["id"], 'enrollmentAgreement')
                    .then(...errorHandler({snackbarSuccess:true}))
                    .then(()=>null)
                            }}
                        >
                          {t("enrollment_agreement")}
                        </Button>
          </Tooltip>}
              </Box>
            </Box>
        </Box>
      )}
    </div>
  );
}

Attendee.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default Attendee;