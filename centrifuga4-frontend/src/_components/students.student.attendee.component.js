import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import {TextField} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import Divider from "@material-ui/core/Divider";
import Person from "./students.student.person.component";

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
  composite: {display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
    gap: theme.spacing(1), width: "100%"}
}));

function Attendee(props) {
  const { children, value, index, title, currentStudent, ...other } = props;

  const { t } = useTranslation();
  const loading = false;
  const classes = useStyles();

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

              <Person currentPerson={currentStudent}/>

              {loading || currentStudent === null
              ?
                  (<Box>
                        <Divider variant="middle" />
                        <Box py={1}><Skeleton variant="text" width="35%" height="45px"></Skeleton></Box>
                      </Box>)
                  :
                  (

                          <Box py={2}>
                            <Divider variant="middle" />
                            <Box className={classes.line}>
              <TextField
                  id="standard-basic"
                  label={t("price per term (€)")}
                  type="number"
                  className={classes.sizeSmall}
                  value={currentStudent["price_term"]}
              />
                          </Box>

                          </Box>
              )

              }
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