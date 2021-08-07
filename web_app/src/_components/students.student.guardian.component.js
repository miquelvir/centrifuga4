import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {MenuItem} from "@material-ui/core";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import StudentGuardianDataService from "../_services/student_guardians.service"
import {student_guardian_relations} from "../_data/relations"
import Person from "./students.student.person.component";
import GuardiansDataService from "../_services/guardians.service";
import {useErrorHandler} from "../_helpers/handle-response";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import * as yup from "yup";
import DirtyTextField from "./dirtytextfield.component";
import {emptyGuardian} from "../_data/empty_objects";
import {useNeeds} from "../_helpers/needs";
import {confirmContext} from "../_context/confirm-context";

function Guardian({  studentId, title, guardianId, deleteGuardianId, addGuardianId, deleteNewGuardian, newGuardian=false, ...other }) {
  const { t } = useTranslation();
  const errorHandler = useErrorHandler();

  const [guardian, setGuardian] = useState(null);

   const [hasNeeds, NEEDS] = useNeeds();
  useEffect(() => {
    if (newGuardian) return;

    GuardiansDataService
            .getOne(guardianId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setGuardian(res["data"]);

                });
  }, [guardianId]);
const confirm = React.useContext(confirmContext);
  return (
    <React.Fragment>


        <Box p={3}>
            <Box px={2}>


              {hasNeeds([NEEDS.delete]) && <IconButton style={{float: 'right'}} onClick={(e) => {
                if (!newGuardian) {
                  confirm.confirm("delete_guardian_question", "not_undone", () => {
                    GuardiansDataService
                      .delete(guardianId)
                      .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
                      .then(function (res) {
                        deleteGuardianId(guardianId);
                      });
                  })
                  return;
                }
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

    </React.Fragment>
  );
}

export default Guardian;