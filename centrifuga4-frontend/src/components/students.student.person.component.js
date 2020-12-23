import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import {MenuItem, TextField} from "@material-ui/core";
import countryList from "../data/countries";
import PropTypes from "prop-types";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import Divider from "@material-ui/core/Divider";

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

function Person(props) {
  const { t } = useTranslation();
  const loading = false;
  const classes = useStyles();

  return (
    <Box>
      {loading
              ?
                  (

                      <Box>
                        {
                          ["100%", "90%", "100%", "100%", "70%", "90%", "70%"].map(value =>
                          {
                            return (<Box py={1}><Skeleton variant="text" width={value} height="45px"></Skeleton></Box>);
                          })
                        }
                        </Box>
                        )
                  :
                  (
                      <Box>

              <TextField id="standard-basic" label={t("id")}
               disabled
               className={classes.line}/>

              <Box className={[classes.line, classes.composite]}>
                {["name", "surname1", "surname2"].map((value) => {
                    return <TextField id="standard-basic" label={t(value)} style={{flex: 1}}/>
                  })
                }
              </Box>

              <TextField id="standard-basic" label={t("email")} type="email"
                         className={classes.line}/>


              <Box className={[classes.line, classes.composite]}>
              <TextField id="standard-basic" label={t("address")} style={{flex: 4}}/>
              <TextField id="standard-basic" label={t("city")} style={{flex: 2}}/>
              <TextField id="standard-basic" label={t("zip")} type="number" style={{flex: 1}}/>
              </Box>

                        <Box className={[classes.line, classes.composite]}>
              <TextField id="standard-basic" label={t("dni")} style={{flex: 1}}/>
              <TextField id="standard-basic" label={t("phone")} type="tel" style={{flex: 1}}/>

              <TextField id="standard-basic" label={t("gender")} style={{flex: 1}} select>
                <MenuItem value="m">male</MenuItem>
                <MenuItem value="f">female</MenuItem>
                <MenuItem value="nb">non binary / not represented by any of the above</MenuItem>
              </TextField>

                        </Box>

                        <Box className={[classes.line, classes.composite]}>
              <TextField id="standard-basic" label={t("birthdate")} type="date"  style={{flex: 1}} InputLabelProps={{ shrink: true }}/>
              <TextField id="standard-basic" label={t("country_of_origin")}  style={{flex: 1}} select >

                {countryList.map((country, idx) => {
                        return (<MenuItem value={country.code}>{country.name}</MenuItem>)
                    })}
              </TextField>

                        </Box>
                      </Box>
              )

              }
    </Box>
  );
}


export default Person;