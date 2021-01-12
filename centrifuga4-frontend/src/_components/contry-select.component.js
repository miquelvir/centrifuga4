import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import React from "react";
import {Autocomplete} from "@material-ui/lab";
import {countries} from "../_data/countries";
import TextField from "@material-ui/core/TextField";
import createStyles from "@material-ui/styles/createStyles";

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}


const useStyles = makeStyles(theme => (createStyles({
  textField: dirty => ({
    '& label.Mui-focused':  {color: dirty? theme.palette.neutral.status.dirty: theme.palette.primary.main},  // todo color to theme
    '& .MuiInput-underline:after': {borderBottomColor: dirty? theme.palette.neutral.status.dirty: theme.palette.primary.main},
      '& label':  {color: dirty? theme.palette.neutral.status.dirty: theme.palette.neutral.emphasisText.medium},
      '& fieldset': {borderColor: dirty? theme.palette.neutral.status.dirty: theme.palette.neutral.emphasisText.medium},
  }
  ),
    option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },})));

export default function DirtyCountrySelect({formik, name, label, ...textFieldProps}) {
  const getInitialOption = (code) => {
      if (code === undefined) return '';
      return countries.find(x=>x.code===code);
  }

  const [option, _setOption] = React.useState(getInitialOption(formik.values[name]));

  React.useEffect(() => {
    _setOption(getInitialOption(formik.values[name]));
  }, [formik.values[name]]);

  const setOption = (option) => {
      const newOption = (option !== null)? option.code: '';
      formik.setFieldValue(name, newOption);
      _setOption(newOption);
  }

  const dirty = formik.values[name] !== formik.initialValues[name];
  const classes = useStyles(dirty);

  const [inputValue, setInputValue] = React.useState('');

  const { t } = useTranslation();

  return (
    <Autocomplete  // o¡todo use
      style={{ width: 300 }}
      options={countries}
      classes={{
        option: classes.option,
      }}
      autoHighlight
      getOptionLabel={(option) => option.label }
      value={option}
        onChange={(event, newValue) => {
          setOption(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        name={name}
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
          label={label}
          className={classes.textField}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}