import React from 'react';
import TextField from '@material-ui/core/TextField';
import {makeStyles} from "@material-ui/core";
import createStyles from "@material-ui/styles/createStyles";


const useStyles = makeStyles(theme => (createStyles({
  root: dirty => ({
          '& label.Mui-focused':  {color: dirty? theme.palette.neutral.status.dirty: theme.palette.primary.main},
          '& .MuiInput-underline:after': {borderBottomColor: dirty? theme.palette.neutral.status.dirty: theme.palette.primary.main},
          '& label':  {color: dirty? theme.palette.neutral.status.dirty: theme.palette.neutral.emphasisText.medium}
  })
})));


const DirtyTextField = (props) => {
    const name = props.name;
    const formik = props.formik;
    const dirty = props.noDirty === true? false: formik.values[name] !== formik.initialValues[name];
    const classes = useStyles(dirty);
    const formikProps = {
        value: formik.values[name] === undefined? '': formik.values[name],  // todo why is this being called with undefined tho
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        error: formik.status  || formik.errors[name] !== undefined,
        helperText: formik.touched[name] && formik.errors[name]
    }
    return <TextField className={classes.root}
       InputLabelProps={{shrink: formik.values[name] !== ''}}
      {...formikProps}
       {...props}
                  />
}

export default DirtyTextField;