import React from 'react';
import TextField from '@material-ui/core/TextField';
import {makeStyles} from "@material-ui/core";
import createStyles from "@material-ui/styles/createStyles";


const useStyles = makeStyles(theme => (createStyles({
  root: dirty => ({
    '& label.Mui-focused':  {color: dirty? '#ffcf3d': theme.palette.primary.main},
    '& .MuiInput-underline:after': {borderBottomColor: dirty? '#ffcf3d': theme.palette.primary.main},
      '& label':  {color: dirty? '#ffcf3d': "white"}}
  )})));


const DirtyTextField = (props) => {
    const name = props.name;
    const formik = props.formik;
    const dirty = formik.values[name] !== formik.initialValues[name];
    const classes = useStyles(dirty);
    const formikProps = {
        value: formik.values[name] === undefined? '': formik.values[name],  // todo why is this being called with undefined tho
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
        error: formik.status  || formik.errors[name] === true
    }

    console.log(formik.values, formik.values[name]);

    if ('InputLabelProps' in props ){
        return <TextField className={classes.root} {...props} {...formikProps}/>;
    } else {
        return <TextField className={classes.root}
                          InputLabelProps={{shrink: formik.values[name] !== ''}}
                          {...props}
                            {...formikProps}/>;
    }

}

export default DirtyTextField;