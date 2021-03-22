import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Fab from "@material-ui/core/Fab";
import {
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, MenuItem,
    TextField,
    Tooltip
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import dataService from "../_services/courses.service";
import * as yup from "yup";
import {useFormik} from "formik";
import {bulkEmailService} from "../_services/bulkEmail.service";
import {useErrorHandler} from "../_helpers/handle-response";
import {safe_email_required} from "../_yup/validators";
import EmailTo from "./emailTo.component";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import SaveIcon from '@material-ui/icons/Save';
const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
    textBox: {
      width: "100%",
        border: "red"
    },
    chip: {
      margin: theme.spacing(0.5)
    },
    chips: {
      marginBottom: theme.spacing(1)
    },
    in: {
      marginBottom: theme.spacing(1)
    },fabs: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },fab: {
    marginLeft: theme.spacing(1),
  }
}));

export default function Attendance({...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [groups, setGroups] = useState([]);
  const [to, setTo] = useState([]);

    const addTo = (t) => {
        setTo([...to, t]);
    }
    const removeTo = (id) => {
        setTo(to.filter(x => x.id !== id));
    }

    const handleSendEmail = () => {
        formik.setSubmitting(true);
        // todo ask for confirmation
        bulkEmailService
            .bulkSend(to.map(g => g.id), formik.values["subject"],
                formik.values["body"], formik.values["emailPreference"])

            .then(...errorHandler({snackbarSuccess: true}))
            .finally(() => {
                formik.setSubmitting(false);
        })
    }

  const errorHandler = useErrorHandler();

  const formik = useFormik({
        initialValues: {emailPreference: "resolved"},
        validationSchema: yup.object({
            email: safe_email_required(t)}),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setSubmitting(true);

        }
    });
  useEffect(() => {
      dataService
            .getAll(null, "*", ['id', "name"])
            .then(...errorHandler({}))
            .then(function (res) {
                setGroups(res["data"]);
            });
  }, [])


  return (
      <div>
          <h1>{t("attendance")}</h1>
          <div className={classes.fabs}>
              <Tooltip title={t("reset")}>
                <Fab className={classes.fab} color="secondary" onClick={handleSendEmail} disabled={formik.isSubmitting}>
                    <CloseIcon/>
                </Fab>
            </Tooltip>
           <Tooltip title={t("save")}>
                <Fab className={classes.fab} color="primary" onClick={handleSendEmail} disabled={formik.isSubmitting}>
                    <SaveIcon/>
                </Fab>
            </Tooltip>
          </div>

      </div>
  );
}
