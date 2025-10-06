import {useTranslation} from "react-i18next";
import React from "react";
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import SendIcon from '@material-ui/icons/Send';
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import DeleteIcon from '@material-ui/icons/Delete';
import ReceiptIcon from '@material-ui/icons/Receipt';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import EuroIcon from '@material-ui/icons/Euro';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import PaymentsDataService from '../_services/payments.service';
import {sendReceiptEmail} from '../_services/emailsReceipts.service';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tooltip from "@material-ui/core/Tooltip";
import Box from "@material-ui/core/Box";
import {Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import {Button, DialogActions, MenuItem} from "@material-ui/core";
import {useNormik} from "../_helpers/normik";
import * as yup from "yup";
import {one_of} from "../_yup/validators";
import {useErrorHandler} from "../_helpers/handle-response";
import InputAdornment from "@material-ui/core/InputAdornment";
import {payment_methods} from "../_data/payment_methods"
import {useNeeds} from "../_helpers/needs";
import {loadingContext} from "../_context/loading-context";
import {confirmContext} from "../_context/confirm-context";
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: '100%',
    backgroundColor: theme.palette.type === 'dark'? '#575757': null
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

export default function PaymentCard({ payment, updatePayment, deletePayment, newPayment=false, addPaymentId, student_id} ) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(newPayment);
  const errorHandler = useErrorHandler();
  const [hasNeeds, NEEDS] = useNeeds();
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const confirm = React.useContext(confirmContext);
const loadingCtx = React.useContext(loadingContext);

const sendReceipt = (id) => {
     loadingCtx.startLoading();
      sendReceiptEmail(id)
          .then(...errorHandler({snackbarSuccess:true}))
          .finally(() => {
              loadingCtx.stopLoading();
          });
}
  const formik = useNormik(!newPayment, {
        initialValues: payment,
        validationSchema: yup.object({method: one_of(t, payment_methods),
                                        quantity: yup.number().required(t("import_required")),
                                        date: yup.date().required(t("date_required"))}),  // todo
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0){
                setStatus();

                if (newPayment) {
                    PaymentsDataService
                        .post({...changedValues, student_id: student_id})
                        .then(...errorHandler({snackbarSuccess:true}))
                        .then(function (res) {
                            addPaymentId(res['id']);
                            confirm.confirm("send_receipt", "send_receipt",
                                () => sendReceipt(res['id']))
                            }).catch(function (err){
                                setStatus(true);
                            })
                        .finally(() => {
                                setSubmitting(false);

                        });
                } else {
                    PaymentsDataService.patch({
                      id: payment["id"],    // id
                      body: changedValues,
                      initial_values: payment  // todo doesnt normik do this?
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

                }

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
                payment["method"] === 'card'? t('has_paid_card'):
                payment["method"] === 'bank-transfer' ? t('tooltip-bank-transfer'):
                payment["method"] === 'bank-direct-debit'? t('tooltip-bank-direct-debit'): t('other-payment-method')
            }>
          <Avatar aria-label="recipe" className={classes.avatar}>
            {payment["method"] === 'cash'? <EuroIcon/>:
                payment["method"] === 'card'? <CreditCardIcon/>:
                payment["method"] === 'bank-transfer'? <AccountBalanceWalletIcon/>:
                    payment["method"] === 'bank-direct-debit'? <AccountBalanceIcon/>:
                    <MoreHorizIcon/>
            }
          </Avatar>
        </Tooltip>

        }
        action={
         hasNeeds([NEEDS.delete]) && <Tooltip title={t("delete")} aria-label={t("delete")}>
          <IconButton onClick={(e) => {
              confirm.confirm("delete_payment", "not_undone", () => {
                  deletePayment(payment['id'])
              });

          }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        }
        title={newPayment? t('new_payment') : `${t("has_paid")} ${payment['quantity']}€`}
        subheader={payment['date']}
      />

        {!newPayment && <CardActions disableSpacing>
            {hasNeeds([NEEDS.paymentReceipts]) &&
            <Tooltip title={t("export_receipt")} aria-label={t("export_receipt")}>
          <IconButton disabled={loadingCtx.loading} aria-label={t("export_receipt")} onClick={(e) => {
              loadingCtx.startLoading();
              PaymentsDataService
                  .downloadSubresource(payment["id"], 'receipt')
                  .then(...errorHandler({snackbarSuccess:true}))
                  .finally(() => {
                      loadingCtx.stopLoading();
                  })
          }}>
            <ReceiptIcon />
          </IconButton>
        </Tooltip>}
            {hasNeeds([NEEDS.paymentReceipts, NEEDS.send_email]) &&
        <Tooltip title={t("send_receipt")} aria-label={t("send_receipt")}>
          <IconButton  disabled={loadingCtx.loading} aria-label={t("send_receipt")} onClick={() => sendReceipt(payment['id'])}>
            <SendIcon />
          </IconButton>
        </Tooltip>}
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
      </CardActions>}
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
                                                { payment_methods.map(
                                                    (method) => (
                                                        <MenuItem key={method} value={method}>{t(method)}</MenuItem>
                                                    )
                                                )
                                                }
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
                                            {hasNeeds([NEEDS.patch]) && <Button type="submit" disabled={!formik.dirty || formik.isSubmitting}>
                                                {newPayment ? t("create") : t("save")}
                                            </Button>}
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
