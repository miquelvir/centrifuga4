import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {MenuItem, TextField} from "@material-ui/core";
import countryList from "../data/countries";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
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
  composite: {display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
    gap: theme.spacing(1), width: "100%"}
}));

function Person(props) {
  const currentPerson = props.currentPerson;
  const { t } = useTranslation();
  const loading = false;
  const classes = useStyles();

  function usePerson(){
    if (currentPerson === null) return;
    console.log("cp", currentPerson["surname1"]);
  }
  // useEffect(usePerson, [currentPerson]);

  const [name, setName] = useState(currentPerson? currentPerson.name: null);
  const handleChange = (e) => setName(e.target.value);

  return (
    <Box>
      {loading || currentPerson === null
              ?
                  (

                      <Box>
                        {
                          ["100%", "100%", "100%", "100%", "100%", "100%"].map(value =>
                          {
                            return (<Box py={0}><Skeleton variant="text" width={value} height="60px"></Skeleton></Box>);
                          })
                        }
                        </Box>
                        )
                  :
                  (
                      <Box>

              <TextField
                  id="standard-basic"
                  label={t("id")}
                  disabled
                  className={classes.line}
                  value={currentPerson["id"]}/>

              <Box className={[classes.line, classes.composite]}>
                <DirtyTextField
                    id="custom-css-standard-input"
                    label={t("name")}
                    style={{flex: 1}}
                    value={name}
                    onChange={handleChange}
                />
                <DirtyTextField
                    id="standard-basic"
                    label={t("surname1")}
                    style={{flex: 1}}
                    value={currentPerson["surname1"]}
                />
                <DirtyTextField
                    id="standard-basic"
                    label={t("surname2")}
                    style={{flex: 1}}
                    value={currentPerson["surname2"]}
                />
              </Box>

              <DirtyTextField
                  id="standard-basic"
                  label={t("email")}
                  type="email"
                  className={classes.line}
                  value={currentPerson["email"]}
              />


              <Box className={[classes.line, classes.composite]}>
              <DirtyTextField
                  id="standard-basic"
                  label={t("address")}
                  style={{flex: 4}}
                  value={currentPerson["address"]}
              />
              <DirtyTextField
                  id="standard-basic"
                  label={t("city")}
                  style={{flex: 2}}
                  value={currentPerson["city"]}
              />
              <DirtyTextField
                  id="standard-basic"
                  label={t("zip")}
                  type="number"
                  style={{flex: 1}}
                  value={currentPerson["zip"]}
              />
              </Box>

                        <Box className={[classes.line, classes.composite]}>
              <DirtyTextField
                  id="standard-basic"
                  label={t("dni")}
                  style={{flex: 1}}
                  value={currentPerson["dni"]}
              />
              <DirtyTextField
                  id="standard-basic"
                  label={t("phone")}
                  type="tel"
                  style={{flex: 1}}
                  value={currentPerson["phone"]}
              />

              <DirtyTextField
                  id="standard-basic"
                  label={t("gender")}
                  style={{flex: 1}}
                  value={currentPerson["gender"]}
                  select>
                <MenuItem value="m">male</MenuItem>
                <MenuItem value="f">female</MenuItem>
                <MenuItem value="nb">non binary / not represented by any of the above</MenuItem>
              </DirtyTextField>

                        </Box>

                        <Box className={[classes.line, classes.composite]}>

                          <DirtyTextField
                              id="standard-basic"
                              label={t("birthdate")}
                              type="date"
                              style={{flex: 1}}
                              value={currentPerson["birth_date"]}
                              InputLabelProps={{ shrink: true }}/>

                              <DirtyTextField
                                  id="standard-basic"
                                  label={t("country_of_origin")}
                                  style={{flex: 1}}
                                  value={currentPerson["country_of_origin"]}
                                  select >

                {countryList.map((country, idx) => {
                        return (<MenuItem value={country.code}>{country.name}</MenuItem>)
                    })}
              </DirtyTextField>

                        </Box>
                      </Box>
              )

              }
    </Box>
  );
}


export default Person;