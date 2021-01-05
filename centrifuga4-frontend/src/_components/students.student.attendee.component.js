import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import {TextField} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import StudentsDataService from "../_services/students.service";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import Divider from "@material-ui/core/Divider";
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
                      additionalFields={[]}
              >
                {/*{loading
              ?
                  (<Box>
                        <Box py={1}><Skeleton variant="text" width="35%" height="60px"/></Box>
                      </Box>)
                  :
                  (

                          <Box py={2}>
                            <Box className={classes.line}>
                              <DirtyTextField
                                label={t("price_term")}
                                style={{flex: 1}}
                                name="price_term"
                                type="number"
                                className={classes.sizeSmall}
                                InputProps={{endAdornment: <InputAdornment position="end">€</InputAdornment>,}}
                            />
                          </Box>

                          </Box>
              )
              }*/}
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