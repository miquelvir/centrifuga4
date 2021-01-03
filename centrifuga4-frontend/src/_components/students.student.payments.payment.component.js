import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import SendIcon from '@material-ui/icons/Send';
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';
import EmailIcon from '@material-ui/icons/Email';
import DeleteIcon from '@material-ui/icons/Delete';
import ReceiptIcon from '@material-ui/icons/Receipt';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import EuroIcon from '@material-ui/icons/Euro';
import PaymentsDataService from '../_services/payments.service'
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Box from "@material-ui/core/Box";
import {Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import {Button, DialogActions, MenuItem} from "@material-ui/core";
import DirtyCountrySelect from "./contry-select.component";
import {useNormik} from "../_helpers/normik";
import * as yup from "yup";
import {one_of} from "../_yup/validators";
import {useErrorHandler} from "../_helpers/handle-response";
import InputAdornment from "@material-ui/core/InputAdornment";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '100%',
    backgroundColor: theme.palette.type === 'dark'? '#575757': null
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },fullWidth: {
        width: "100%"
    },
    sizeSmall: {
        width: "25ch"
    },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    }
}));

export default function PaymentCard({ payment, updatePayment, deletePayment }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const errorHandler = useErrorHandler();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formik = useNormik(true, {
        initialValues: payment,
        validationSchema: yup.object({method: one_of(t, ['bank-transfer', 'cash']),
                                        quantity: yup.number().required(t("import_required"))}),  // todo
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0){
                setStatus();
                    PaymentsDataService.patch({
                      id: payment["id"],    // id
                      body: changedValues,
                      initial_values: payment
                  }).then(...errorHandler({snackbarSuccess:true}))
                        .then(function (patched_body) {
                                formik.resetForm(patched_body);
                                updatePayment(patched_body['id'], patched_body);
                            }).catch(function (err){
                                setStatus(true);
                    })
                        .finally(() => {
                                setSubmitting(false);
                        });


                    } else {
                setSubmitting(false);
            }

        }
    });


  return (
      <Box my={2}>
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Tooltip title={payment["method"] === 'cash'? t('has_paid_cash'):
                payment["method"] === 'bank-transfer'? t('bank-transfer'):
                    t('other-payment-method')
            }>
          <Avatar aria-label="recipe" className={classes.avatar}>
            {payment["method"] === 'cash'? <EuroIcon/>:
                payment["method"] === 'bank-transfer'? <AccountBalanceIcon/>:
                    <MoreHorizIcon/>
            }
          </Avatar>
        </Tooltip>

        }
        action={
          <Tooltip title={t("delete")} aria-label={t("delete")}>
          <IconButton onClick={(e) => {deletePayment(payment['id'])}}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        }
        title={`${t("has_paid")} ${payment['quantity']}€`}
        subheader={payment['date']}
      />
      <CardActions disableSpacing>
        <Tooltip title={t("export_receipt")} aria-label={t("export_receipt")}>
          <IconButton aria-label={t("export_receipt")}>
            <ReceiptIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("send_receipt")} aria-label={t("send_receipt")}>
          <IconButton aria-label={t("send_receipt")}>
            <SendIcon />
          </IconButton>
        </Tooltip>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box>
            {payment === null
                ?
                (

                    <Box>
                        {
                            ["100%", "100%", "100%"].map((value, idx) => {
                                return (
                                    <Box key={idx} py={0}>
                                        <Skeleton variant="text" width={value} height="60px"/>
                                    </Box>);
                            })
                        }
                    </Box>
                )
                :
                (
                        <form onSubmit={formik.handleSubmit}>
                                        <DirtyTextField
                                            label={t("id")}
                                            name="id"
                                            disabled
                                            className={classes.line}
                                            formik={formik}
                                            />

                                        <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                label={t("method")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="method"
                                                select>
                                                <MenuItem value="bank-transfer">{t("bank_transfer")}</MenuItem>
                                                <MenuItem value="cash">{t("cash")}</MenuItem>
                                            </DirtyTextField>
                                            <DirtyTextField
                                                label={t("import")}
                                                formik={formik}
                                                type="number"
                                                style={{flex: 1}}
                                                name="quantity"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">€</InputAdornment>,
                                                  }}
                                            />
                                            <DirtyTextField
                                                label={t("date")}
                                                formik={formik}
                                                type="date"
                                                style={{flex: 1}}
                                                name="date"
                                                InputLabelProps={{shrink: true}}/>
                                        </Box>

                             <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                label={t("concept")}
                                                formik={formik}
                                                style={{flex: 1}}
                                                multiline
                                                rowsMax={8}
                                                name="concept"
                                            />
                                        </Box>


                                        <DialogActions>
                                            <Button
                                                type="button"
                                                className="outline"
                                                onClick={formik.handleReset}
                                                disabled={!formik.dirty || formik.isSubmitting}
                                            >
                                                {t("reset")}
                                            </Button>
                                            <Button type="submit" disabled={!formik.dirty || formik.isSubmitting}>
                                                {t("save")}
                                            </Button>
                                        </DialogActions>
                                    </form>
                )

            }
        </Box>
        </CardContent>
      </Collapse>
    </Card></Box>
  );
}
