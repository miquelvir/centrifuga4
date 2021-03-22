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
import Button from "@material-ui/core/Button";
import CardHeader from "@material-ui/core/CardHeader";
import EuroIcon from "@material-ui/icons/Euro";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import CardActions from "@material-ui/core/CardActions";
import PaymentsDataService from "../_services/payments.service";
import ReceiptIcon from "@material-ui/icons/Receipt";
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import CardContent from "@material-ui/core/CardContent";
import {Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import {payment_methods} from "../_data/payment_methods";
import InputAdornment from "@material-ui/core/InputAdornment";
import Card from "@material-ui/core/Card";

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
      marginBottom: theme.spacing(1),
        marginTop: theme.spacing(2)
    },fab: {
    position: 'absolute',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  }, attach: {
      marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    card: {
      marginTop: theme.spacing(1)
    }
}));

export default function Email({...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [groups, setGroups] = useState([]);
  const [to, setTo] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

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
                formik.values["body"], formik.values["emailPreference"], selectedFiles)

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
    const onFileChange = event => {
      // Update the state
      setSelectedFiles([...event.target.files]);
    };
    const getFormData = () => {
        if (selectedFiles.length === 0) return null;
      // Create an object of formData
      const formData = new FormData();

      // Update the formData object
        selectedFiles.forEach(sf => {
            formData.append(
            sf.name,
            sf,
            sf.name
          );
        })


      return formData;
    };

    const fileDataRepresentation = () =>  {
        console.log("sfs", selectedFiles);
      return selectedFiles.map(selectedFile => (
          <Card className={classes.card}>
      <CardHeader
        action={
         <Tooltip title={t("delete")} aria-label={t("delete")}>
          <IconButton onClick={(e) => {
              setSelectedFiles(selectedFiles.filter(x => x !== selectedFile));
          }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        }
        titleTypographyProps={{variant: 'subheading'}}
        title={selectedFile.name}
      />
    </Card>));
    }


  return (
      <div>
          <h1>{t("email")}</h1>
          <Box className={classes.chips}>
              {t("to")}: {
                  to.length > 0? to.map(x =>
                      <Tooltip title={t("delete")}>
                  <Chip variant="outlined"
              color="primary"
                        className={classes.chip}
              size="small"
              avatar={<Avatar>G</Avatar>}
              label={x.name}
              onClick={() => {
                removeTo(x.id);
              }}/></Tooltip>
                  ) : " - "
              }
          </Box>

          <TextField
              className={classes.in}
            label={t("use_emails")}
            style={{width: "100%"}}
              value={formik.values["emailPreference"] === undefined? '': formik.values["emailPreference"]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.status  || formik.errors["emailPreference"] !== undefined}
        helperText={formik.touched["emailPreference"] && formik.errors["emailPreference"]}

            name="emailPreference"
            select>
            <MenuItem value="contacts">{t("contacts")}</MenuItem>
            <MenuItem value="resolved">{t("resolved")}</MenuItem>
          <MenuItem value="student">{t("student")}</MenuItem>
          <MenuItem value="all">{t("all")}</MenuItem>
        </TextField>



          <EmailTo
            formik={formik}
            style={{width: "100%"}}
            options={groups.filter(g => !to.includes(g))}
            addTo={addTo}
            name={"courses"}
            label={t("courses")}
        />
        <TextField
              className={classes.in}
            label={t("subject")}
            style={{width: "100%"}}
            value={formik.values["subject"] === undefined? '': formik.values["subject"]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.status  || formik.errors["subject"] !== undefined}
            helperText={formik.touched["subject"] && formik.errors["subject"]}
            name="subject"
            />

        <TextField
            className={classes.textBox}
            multiline
            rows={16}
            value={formik.values["body"] === undefined? '': formik.values["body"]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.status  || formik.errors["body"] !== undefined}
            helperText={formik.touched["body"] && formik.errors["body"]}
            name={"body"}
          />
          <div>
          {fileDataRepresentation()}
          <input
              style={{ display: "none" }}
              id="contained-button-file"
              type="file"
              multiple
              onChange={onFileChange}
          />
          <label htmlFor="contained-button-file">
            <Button className={classes.attach} variant="contained" color="primary" component="span">
                {t("upload")}
            </Button>
          </label>
          </div>
          <Tooltip title={t("send_email")}>
                <Fab className={classes.fab} color="primary" onClick={handleSendEmail} disabled={formik.isSubmitting}>
                    <SendIcon/>
                </Fab>
            </Tooltip>
      </div>
  );
}
