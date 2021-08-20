import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import {useTranslation} from "react-i18next";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

const useStyles = makeStyles((theme) => ({
    
  }));
  
  export default function MoreButton(props) {
    const classes = useStyles();
    const {t} = useTranslation();
  
    return (
        <Chip
          label={t("load-more")}
          clickable
          variant="outlined"
          icon={<MoreHorizIcon/>}
          {...props}
        />
    );
  }