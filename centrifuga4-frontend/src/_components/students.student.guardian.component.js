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

function Guardian({ children, value, index, title, guardianId, patchService, ...other }) {
  const { t } = useTranslation();
  const loading = false;
  const classes = useStyles();
  const errorHandler = useErrorHandler();

  const [guardian, setGuardian] = useState(null)

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
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
            <Box px={2}>
              <h1>{title}</h1>

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