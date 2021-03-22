import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import React, {useEffect} from "react";
import {Autocomplete} from "@material-ui/lab";
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
  textField: {
    '& label.Mui-focused':  {color: theme.palette.primary.main},  // todo color to theme
    '& .MuiInput-underline:after': {borderBottomColor: theme.palette.primary.main},
      '& label':  {color:theme.palette.neutral.emphasisText.medium},
      '& fieldset': {borderColor: theme.palette.neutral.emphasisText.medium},
  },
    option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },})));

export default function EmailTo({formik, name, label, options, addTo, ...textFieldProps}) {

  const [option, _setOption] = React.useState(null);

  React.useEffect(() => {
    _setOption(null);
  }, [formik.values, name]);

  const setOption = (option) => {
      const newOption = (option !== null)? option.code: '';
      formik.setFieldValue(name, newOption);
      _setOption(option);
      if (option) addTo(option);
  }



  const classes = useStyles();

  const [inputValue, setInputValue] = React.useState('');

  const { t } = useTranslation();

  return (
    <Autocomplete
      style={{ width: "100%" }}
      options={options}
      classes={{
        option: classes.option,
      }}
      autoHighlight
      getOptionLabel={(option) => option.name }
      getOptionSelected={(o) => o.id === option.id}
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
        <React.Fragment key={option.id}>
          <span>{option.name}</span>
        </React.Fragment>
      )}

      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth={1}
          className={classes.textField}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
          error={formik.status  || formik.errors[name] !== undefined}
        helperText={formik.touched[name] && formik.errors[name]}
        />
      )}
    />
  );
}