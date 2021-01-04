import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import PaymentsDataService from "../_services/payments.service";
import {useErrorHandler} from "../_helpers/handle-response";
import PaymentCard from "./students.student.payments.payment.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
  root: {

  },
  fullWidth: {
    width: "100%"
  },
  sizeSmall: {
    width: "25ch"
  },
  line: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: theme.palette.primary.main
  },
  composite: {display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
    gap: theme.spacing(1), width: "100%"}
}));

function Payments({ children, value, index, title, paymentIds, deletePaymentFromStudent, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const errorHandler = useErrorHandler();

  const [payments, setPayments] = useState([])

  const updatePayment = (id, body) => {
    setPayments(payments.map(payment => {
      if (payment.id !== id) return payment;
      return body;
    }))
  }

  const deletePayment = (id) => {
    PaymentsDataService.delete(id)
        .then(...errorHandler({snackbarSuccess:true}))
        .then(function (r) {
             deletePaymentFromStudent(id);
             // setPayments(payments.filter(payment => payment.id !== id));  // todo why needed
        });
  }

  useEffect(() => {
    console.log("changeeeed!", paymentIds);
    if (paymentIds.length === 0){
      setPayments([]);
    } else {
      console.log(paymentIds);
      PaymentsDataService
            .getSome(paymentIds)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setPayments(res.map(res => res["data"]).sort((p1, p2) => p1.date.localeCompare(p2.date)));
                });
    }
  }, [paymentIds])

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      className={classes.root}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
            <Box px={2}>

              {
                payments && payments.map(payment =>
                    (<PaymentCard payment={payment} key={payment['id']} updatePayment={updatePayment} deletePayment={deletePayment}/>)
                )
              }

              {payments.length === 0 &&
                <Typography>{t("no_payments")}</Typography>
              }

              <Fab className={classes.fab}>
              <AddIcon/>
            </Fab>
            </Box>
        </Box>
      )}
    </div>
  );
}

Payments.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default Payments;