import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import {Autocomplete} from "@material-ui/lab";
import {countries} from "../_data/countries";
import {MenuItem, TextField} from "@material-ui/core";
import countryList from "../_data/countries";
import DirtyTextField from "./dirtytextfield.component";

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

export default function CountrySelect({formik, ...textFieldProps}) {
  const classes = useStyles();

  const { t } = useTranslation();

  return (
    <Autocomplete
      id="country-select-demo"
      style={{ width: 300 }}
      options={countries}
      classes={{
        option: classes.option,
      }}
      autoHighlight
      getOptionLabel={(option) => {
          console.log(option);
          return option.label === undefined? option.name : option.label;
      }}
      renderOption={(option) => (
        <React.Fragment>
          <span>{countryToFlag(option.code)}</span>
          {option.label} ({option.code}) +{option.phone}
        </React.Fragment>
      )}
      renderInput={(params) => (
        <DirtyTextField
            id="standard-basic"
            label={t("country_of_origin")}
            style={{flex: 1}}
            {...params}
            name="country_of_origin"
            formik={formik}
            value={formik.values["country_of_origin"] === null? '': formik.values["country_of_origin"]}
              onChange={formik.handleChange}
            onBlur={formik.handleBlur}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            {...textFieldProps}/>
      )}
    />
  );
}