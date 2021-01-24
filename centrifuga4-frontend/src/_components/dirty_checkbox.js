import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import {Checkbox, FormControlLabel} from "@material-ui/core";
import {allNeeds} from "../_data/needs";
import Typography from "@material-ui/core/Typography";
import createStyles from "@material-ui/styles/createStyles";
import TextField from "@material-ui/core/TextField";
import useTheme from "@material-ui/core/styles/useTheme";

const useStyles = makeStyles(theme => (createStyles({
  root: dirty => ({
         color: dirty? theme.palette.neutral.status.dirty: theme.palette.neutral.emphasisText.medium,
    "&.Mui-checked": {
      color: dirty? theme.palette.neutral.status.dirty: theme.palette.primary.main
    }

})})));


const DirtyCheckbox = ({name, value, formik, noDirty=false, ...props}) => {
    const dirty = noDirty === true? false: formik.values[name] !== undefined && formik.initialValues[name] !== undefined && formik.values[name].includes(value) !== formik.initialValues[name].includes(value);

    const classes = useStyles(dirty);
     if (value === "users"){
        console.log("dirty", dirty, classes.root);
        console.log(props.checked);
    }


    return  <Checkbox
                      name={name}
                      className={classes.root}
                      value={value}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.status  || formik.errors[name] !== undefined}
                    helperText={formik.touched[name] && formik.errors[name]}
                      checked={formik.values[name]}
                     {...props}/>
}

export default DirtyCheckbox;