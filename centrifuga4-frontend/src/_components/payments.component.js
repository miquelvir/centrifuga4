import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import PaymentsDataService from "../_services/payments.service";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import {useErrorHandler} from "../_helpers/handle-response";
import {loadingContext} from "../_context/loading-context";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
    root2: {
    display: 'flex',
  },
  formControl: {
      padding: theme.spacing(2),
        maxHeight: '50vh',
      overflow: 'auto',
      minWidth: '40vw'
  },
    dialog: {

    },
  left: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
      position: 'relative',

  },fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  }
}));


export default function Payments({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const errorHandler = useErrorHandler();
 const loadingCtx = React.useContext(loadingContext);
  return (
      <div>
          <h1>{t("payments")}</h1>

      <List className={classes.list}>
        <ListItem button
                  onClick={() => {
                      if (loadingCtx.loading) return;
                      loadingCtx.startLoading();
                      PaymentsDataService
                          .downloadCsv(null, null,'*', null)
                          .then(...errorHandler({}))
                          .finally(() => {
                              loadingCtx.stopLoading();
                          })

                  }}>
        <ListItemAvatar>
            <Avatar className={classes.avatar}>
                csv
            </Avatar>
        </ListItemAvatar>
        <ListItemText id="name" primary={t("export_all")}/>

    </ListItem>
    <Divider/>
    </List></div>
  );
}
