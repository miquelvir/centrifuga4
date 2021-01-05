import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
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
import {education_years} from "../_data/education";


const useStyles = makeStyles((theme) => ({

  fullWidth: {
    width: "100%"
  },

  sizeSmall: {
    width: "25ch"
  },
  line: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  composite: {display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
    gap: theme.spacing(1), width: "100%"}
}));

function Attendee({ children, value, index, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, ...other }) {
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
                  <Skeleton style={{float: 'right'}}><IconButton/></Skeleton>
              :
              <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                  setOpenConfirmDeleteDialog(true);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>}

              <Person currentPerson={currentStudent}
                      updateCurrentStudent={updateCurrentStudent}
                      patchService={patchService}
                      additionalValidation={{
                        is_early_unenrolled: yup.boolean().required(t("is_early_unenrolled_required")).when('is_enrolled',
                            {is: true,
                            then: yup.boolean().test(
                                  'enrolledUnenrolledCollision2',
                                  t('enrolled_unenrolled'),
                                  v => !v
                                )}),
                        is_enrolled: yup.boolean().required(t("is_enrolled_required"))
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
                                <MenuItem value="bank-transfer">{t("bank_transfer")}</MenuItem>
                                <MenuItem value="cash">{t("cash")}</MenuItem>
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
                                label={t("is_enrolled")}
                                style={{flex: 1}}
                                name="is_enrolled"
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>,
                              <DirtyTextField
                                label={t("is_early_unenrolled")}
                                style={{flex: 1}}
                                name="is_early_unenrolled"
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