import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {useTranslation} from "react-i18next";
import {Checkbox, Box, ListItem, ListItemIcon, ListItemText, Tooltip} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { styled } from "@material-ui/core/styles";
import InsertCommentIcon from '@material-ui/icons/InsertComment';
import {STATUS_ATTENDANCE, STATUS_ABSENT, STATUS_ABSENT_JUSTIFIED} from './status';
import IconButton from '@material-ui/core/IconButton';

import OutlinedInput from "@material-ui/core/OutlinedInput";


const useStyles = makeStyles((theme) => ({
    formControl: {
        [theme.breakpoints.down('sm')]: {minWidth: '50%', maxWidth: '50%'},
        [theme.breakpoints.up('sm')]: {minWidth: '25%', maxWidth: '25%'}
    },
    selectStatus: {
        '&:before': {
            borderColor: 'red',
        },
        '&:after': {
            borderColor: 'red',
        }
    },
    root: {
        width: '100%'
    }
  }));

export default function AttendanceItem({student, attendance, setAttendance, handleOpenCommentBox}) {
    
    const classes = useStyles();
    const labelId = `checkbox-list-label-${student["id"]}`;
    const { t } = useTranslation();

    const status = attendance === null? null: attendance["status"];
    const setStatus = (newStatus) => setAttendance({...attendance, status: newStatus});
    
    const handleChange = (event) => {
        setStatus(event.target.value);
      };
      const toggleStatus = () => {
          if (status === STATUS_ATTENDANCE) return setStatus(STATUS_ABSENT);
          setStatus(STATUS_ATTENDANCE);
      }

      const useOutlinedInputStyles = makeStyles(theme => ({
        root: {
          "& $notchedOutline": {
            borderColor: status === STATUS_ATTENDANCE? theme.palette.neutral.status.success: status === STATUS_ABSENT? theme.palette.neutral.status.error: theme.palette.neutral.status.dirty  
          },
        },
        focused: {},
        notchedOutline: {}
      }));
      const outlinedInputClasses = useOutlinedInputStyles();

    return (
        <ListItem key={student['id']} role={undefined} dense button onClick={toggleStatus} className={classes.root}>
            <FormControl variant="outlined" className={classes.formControl}>
        
            <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            value={status}
            onChange={handleChange}
            className={classes.selectStatus}
            onClick={(e) => e.stopPropagation()}
            input={
                <OutlinedInput
                  id="outlined-age-simple"
                  classes={outlinedInputClasses}
                />}
            >
                <MenuItem value={STATUS_ATTENDANCE}>{t("attended")}</MenuItem>
                <MenuItem value={STATUS_ABSENT}>{t("absent")}</MenuItem>
                <MenuItem value={STATUS_ABSENT_JUSTIFIED}>{t("absent-justified")}</MenuItem>
                </Select>
            </FormControl>
            <Box px={2}>
            <Tooltip title={t("add-comment")}>
                <IconButton color="secondary" aria-label={t("add-comment")} onClick={(e) => {
                    e.stopPropagation();
                    handleOpenCommentBox();
                    }}>
                    <InsertCommentIcon />
                </IconButton>
            </Tooltip>
            </Box>
            <ListItemText id={labelId} primary={student["full_name"]} />
        </ListItem>
    );
}