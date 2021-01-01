import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import React from "react";
import {Autocomplete} from "@material-ui/lab";
import {countries} from "../_data/countries";
import DirtyTextField from "./dirtytextfield.component";
import TextField from "@material-ui/core/TextField";

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
    <Autocomplete  // o¡todo use https://github.com/mui-org/material-ui/issues/18331
      id="country_of_origin"
      style={{ width: 300 }}
      options={countries}
      classes={{
        option: classes.option,
      }}
      autoHighlight
      getOptionLabel={(option) => {
          if (typeof option === 'string') {
                console.log("h");
                countries.filter(x => x.label.toLowerCase() === option.toLowerCase()).forEach(x => {
                    console.log("a", x);
                    option = x;
                })
            }
          console.log(option);
          return option.label;
      }}
      value={formik.values["country_of_origin"] === undefined? '': formik.values["country_of_origin"]}
      onChange={(x) => {
          console.log("onChangeeeeeeeeeeeee", x);
          formik.handleChange(x);
      }}  // todo initial values and DirtyAutocomplete
        name="country_of_origin"
      onBlur={formik.handleBlur}
      renderOption={(option) => (
        <React.Fragment>
          <span>{countryToFlag(option.code)}</span>
          {option.label} ({option.code}) +{option.phone}
        </React.Fragment>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a country"
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}