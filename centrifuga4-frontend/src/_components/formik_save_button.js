import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import {Checkbox, FormControlLabel} from "@material-ui/core";
import {allNeeds} from "../_data/needs";
import Typography from "@material-ui/core/Typography";
import createStyles from "@material-ui/styles/createStyles";
import TextField from "@material-ui/core/TextField";
import useTheme from "@material-ui/core/styles/useTheme";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import SaveIcon from "@material-ui/icons/Save";


const SaveButton = ({formik, ...props}) => {
    const {t} = useTranslation();
    return   <IconButton  type="submit"
                                    disabled={!formik.dirty || formik.isSubmitting}
                          {...props}>
                            <Tooltip title={t("save")} aria-label={t("save")}>
                                <SaveIcon/>
                            </Tooltip>
                        </IconButton>
}

export default SaveButton;