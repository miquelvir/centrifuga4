import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {MenuItem} from "@material-ui/core";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import StudentGuardianDataService from "../_services/student_guardians.service"
import {student_guardian_relations} from "../_data/relations"
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
import * as yup from "yup";
import DirtyTextField from "./dirtytextfield.component";
import {emptyGuardian} from "../_data/empty_objects";
import {useNeeds} from "../_helpers/needs";

function Guardian({ value, index, studentId, title, guardianId, deleteGuardianId, addGuardianId, deleteNewGuardian, newGuardian=false, ...other }) {
  const { t } = useTranslation();
  const errorHandler = useErrorHandler();

  const [guardian, setGuardian] = useState(null);

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState(false);
  const [hasNeeds, NEEDS] = useNeeds();
  useEffect(() => {
    if (newGuardian) return;

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


              {hasNeeds([NEEDS.delete]) && <IconButton style={{float: 'right'}} onClick={(e) => {
                if (!newGuardian) return setOpenConfirmDeleteDialog(true);
                deleteNewGuardian();
              }}>
                <Tooltip title={t("delete")} aria-label={t("delete")}>
                  <DeleteIcon/>
                </Tooltip>
              </IconButton>}


              <Person currentPerson={newGuardian? emptyGuardian: guardian}
                      studentId={studentId}
                      newPerson={newGuardian}
                      updateCurrentStudent={(x) => {
                        if (!newGuardian) return setGuardian(x);
                        StudentGuardianDataService.postWithId(studentId, x)
                          .then(...errorHandler({snackbarSuccess: true}))
                          .then(() => {
                          addGuardianId(x);
                        });
                      }}
                      patchService={GuardiansDataService}
                      additionalValidation={{
                        relation: yup.string().required(t("relation_required"))}}
                      additionalFields={
                        [[<DirtyTextField
                                label={t("relation")}
                                style={{flex: 1}}
                                name="relation"
                                select
                            >
                          {student_guardian_relations.map((r) => (
                                   <MenuItem key={r} value={r}>{t(r)}</MenuItem>
                                ))}
                                ))}

                        </DirtyTextField>]]}
              />

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