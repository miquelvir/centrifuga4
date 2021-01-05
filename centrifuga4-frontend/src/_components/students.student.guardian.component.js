import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import {TextField} from "@material-ui/core";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import Divider from "@material-ui/core/Divider";
import Person from "./students.student.person.component";
import GuardiansDataService from "../_services/guardians.service";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";

// here
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

function Guardian({ children, value, index, title, guardianId, patchService, deleteGuardianId, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const errorHandler = useErrorHandler();

  const [guardian, setGuardian] = useState(null);

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState(false);


  useEffect(() => {
    GuardiansDataService
            .getOne(guardianId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setGuardian(res["data"]);

                });
  }, [guardianId])

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
        <DialogTitle id="alert-dialog-title">{t("delete_guardian_question")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{t("action_cant_undone")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={(e) => {
            setOpenConfirmDeleteDialog(false);
          }} color="primary">
            {t("cancel")}
          </Button>
          <Button onClick={(e) => {
            GuardiansDataService
              .delete(guardianId)
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                      deleteGuardianId(guardianId);
                  });
            setOpenConfirmDeleteDialog(false);
          }} color="primary" autoFocus>
            {t("delete_guardian")}
          </Button>
        </DialogActions>
      </Dialog>

      {value === index && (
        <Box p={3}>
            <Box px={2}>


          <IconButton style={{float: 'right'}}  onClick={(e) => {
            setOpenConfirmDeleteDialog(true);
          }}>
            <Tooltip title={t("delete")} aria-label={t("delete")}>
            <DeleteIcon />
             </Tooltip>
          </IconButton>


              <Person currentPerson={guardian} updateCurrentStudent={setGuardian} patchService={patchService}/>

            </Box>
        </Box>
      )}
    </div>
  );
}

Guardian.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default Guardian;