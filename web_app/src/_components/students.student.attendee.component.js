import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import {MenuItem} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import StudentsDataService from "../_services/students.service";
import {makeStyles} from "@material-ui/core/styles";
import * as yup from 'yup';
import {IconButtonSkeleton} from "../_skeletons/iconButton"
import Person from "./students.student.person.component";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import GuardiansDataService from "../_services/guardians.service";
import PaymentsDataService from "../_services/payments.service";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import DirtyTextField from "./dirtytextfield.component";
import SendIcon from "@material-ui/icons/Send";
import {sendEnrollmentEmail} from "../_services/emailsEnrollment.service";
import Divider from "@material-ui/core/Divider";
import {sendGrantEmail} from "../_services/emailsGrants.service";
import GetAppIcon from "@material-ui/icons/GetApp";
import {payment_methods} from "../_data/payment_methods";
import {emptyAttendee} from "../_data/empty_objects";
import {useNeeds} from "../_helpers/needs";
import {loadingContext} from "../_context/loading-context";
import {confirmContext} from "../_context/confirm-context";
import TextField from "@material-ui/core/TextField";


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

function Attendee({ children, setNewStudent, addStudentId, newStudent, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const [hasNeeds, NEEDS] = useNeeds();
  const confirm = React.useContext(confirmContext);

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
  const loadingCtx = React.useContext(loadingContext);
  const sendGrantLetter = (id) => {
      loadingCtx.startLoading();
      sendGrantEmail(id)
          .then(...errorHandler({snackbarSuccess: true}))
          .finally(() => {
              loadingCtx.stopLoading();
          });
  }
  const sendEnrollmentAgreement = () => {
      loadingCtx.startLoading();
      sendEnrollmentEmail(currentStudent['id'])
          .then(...errorHandler({snackbarSuccess: true}))
          .finally(() => {
              loadingCtx.stopLoading();
          });
  }



  return (
    <React.Fragment>

        <Box p={3}>
            <Box px={2}>
              {loading?
                  !newStudent && <IconButtonSkeleton className={classes.actionIcon}/>
              :
              !newStudent && hasNeeds([NEEDS.guardians, NEEDS.post]) && <Tooltip style={{float: 'right'}} title={t("new_guardian")} aria-label={t("new_guardian")}>
                <IconButton onClick={(e) => {
                  addNewGuardian();
                }}>
                  <PersonAddIcon />
                </IconButton>
              </Tooltip>
              }


              {loading && !newStudent ?
                   <IconButtonSkeleton className={classes.actionIcon}/>
              :
                hasNeeds([NEEDS.delete]) && <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                    if (newStudent) {
                        setNewStudent(false);
                    } else {
                        confirm.confirm("delete_student_question",
      "student_also_deletes",
      () => {
                            deleteFullStudent(currentStudent['id'])
      });
                    }

                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }

              <Person
                      currentPerson={newStudent? emptyAttendee: currentStudent}
                      newPerson={newStudent}
                      updateCurrentStudent={(x) => {
                        if (!newStudent) return updateCurrentStudent(x);
                        addStudentId(x);
                      }}
                      patchService={patchService}
                      onUpdate={(changedBody) => {
                        if ("enrolment_status" in changedBody && changedBody["enrolment_status"] === "enrolled"){
                          confirm.confirm("send_grant_letter_question",
                          "this_will_be_sent",
                          () => {
                                sendGrantLetter(changedBody['id']);
                          });
                        }
                      }}
                      additionalValidation={{
                        enrolment_status: yup.string().required(t("status_required")),
                        image_agreement: yup.boolean().required(t("image_required")),
                        birth_date: yup.date().required(t("birthdate_required"))
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
                            null,
                            [<DirtyTextField
                                label={t("birthdate")}
                                type="date"
                                style={{flex: 1}}
                                name="birth_date"
                                InputLabelProps={{shrink: true}}/>,
                            <DirtyTextField
                              label={t("years_in_xamfra")}
                              type="number"
                              style={{flex: 1}}
                              name="years_in_xamfra"/>],
                          [
                              <DirtyTextField
                                label={t("status")}
                                style={{flex: 1}}
                                name="enrolment_status"
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
                          ], [<DirtyTextField
                                label={t("pre_enrolment_date")}
                                type="date"
                                style={{flex: 1}}
                                name="pre_enrolment_date"
                                InputLabelProps={{shrink: true}}/>,
                                <DirtyTextField
                                label={t("enrolment_date")}
                                type="date"
                                style={{flex: 1}}
                                name="enrolment_date"
                                InputLabelProps={{shrink: true}}/>,
                                <DirtyTextField
                                label={t("early_unenrolment_date")}
                                type="date"
                                style={{flex: 1}}
                                name="early_unenrolment_date"
                                InputLabelProps={{shrink: true}}/>
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

              {!loading && !newStudent && <Box my={3}>
            <Divider />
            </Box>}

              <Box className={[classes.line, classes.composite]}>
                {!loading && !newStudent && hasNeeds([NEEDS.send_email]) &&
                <Tooltip style={{flex: 1}} title={t("send_grant_letter")} aria-label={t("send_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      disabled={loadingCtx.loading}
                      startIcon={<SendIcon/>}
                      onClick={(e) => {
                        sendGrantLetter(currentStudent['id']);
                      }}
                  >
                    {t("grant_letter")}
                  </Button>
                </Tooltip>}

                {!loading && !newStudent &&
                <Tooltip style={{flex: 1}} title={t("export_grant_letter")} aria-label={t("export_grant_letter")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      disabled={loadingCtx.loading}
                      startIcon={<GetAppIcon/>}
                      onClick={(e) => {
                          if (loadingCtx.loading) return;
                          loadingCtx.startLoading();
                        StudentsDataService
                            .downloadSubresource(currentStudent["id"], 'grantLetter')
                            .then(...errorHandler({snackbarSuccess: true}))
                            .finally(() => {
                                loadingCtx.stopLoading();
                            })
                      }}
                  >
                    {t("grant_letter")}
                  </Button>
                </Tooltip>}
              </Box>

              <Box className={[classes.line, classes.composite]}>
                {!loading && !newStudent && hasNeeds([NEEDS.send_email]) &&
                <Tooltip style={{flex: 1}} title={t("send_enrolment_agreement")}
                                                     aria-label={t("enrolment_agreement")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<SendIcon/>}
                      disabled={loadingCtx.loading}
                      onClick={(e) => {
                        sendEnrollmentAgreement();
                      }}
                  >
                    {t("enrolment_agreement")}
                  </Button>
                </Tooltip>}

                {!loading && !newStudent && <Tooltip style={{flex: 1}} title={t("export_enrolment_agreement")}
                                                     aria-label={t("export_enrolment_agreement")}>
                  <Button
                      variant="contained"
                      color="default"
                      className={classes.button}
                      startIcon={<GetAppIcon/>}
                      disabled={loadingCtx.loading}
                      onClick={(e) => {
                          if (loadingCtx.loading) return;
                          loadingCtx.startLoading();
                        StudentsDataService
                            .downloadSubresource(currentStudent["id"], 'enrolmentAgreement')
                            .then(...errorHandler({snackbarSuccess: true}))
                            .finally(() => {
                                loadingCtx.stopLoading();
                            })
                      }}
                  >
                    {t("enrolment_agreement")}
                  </Button>
                </Tooltip>}
              </Box>
            </Box>
        </Box>
    </React.Fragment>
  );
}


export default Attendee;
