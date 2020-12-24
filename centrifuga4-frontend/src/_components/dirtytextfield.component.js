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
    const dirty = formik.values[name] !== formik.initialValues[name]
        && !(formik.values[name] === ""  && formik.initialValues[name] === null) ;
    const classes = useStyles(dirty);
    return <TextField className={classes.root} {...props}/>;
}

export default DirtyTextField;