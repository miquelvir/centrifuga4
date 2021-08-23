import React from 'react';
import { Divider } from '@material-ui/core';
import Box from "@material-ui/core/Box";
import XamfraLogo from './xamfra.logo.component';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper
    }
  }));
  

export default function XamfraHeader(props) {
    
    const classes = useStyles();

    return <Box className={classes.root}>
        <Box p={2} style={{width: '100%'}}>
            {props.children}
       <XamfraLogo/>
</Box> 
<Divider />
        </Box>
}