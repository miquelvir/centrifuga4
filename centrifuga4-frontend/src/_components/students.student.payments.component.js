import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import PaymentsDataService from "../_services/payments.service";
import {useErrorHandler} from "../_helpers/handle-response";
import PaymentCard from "./students.student.payments.payment.component";
import {Skeleton} from "@material-ui/lab";

const getDefaultValues = () => {
    const date = new Date();
    const dd = date.getDate();
    const mm = date.getMonth() + 1; //Month from 0 to 11
    const yyyy = date.getFullYear();
    return {'id': null, 'date': `${yyyy}-${mm<=9 ? '0' + mm : mm}-${dd <= 9 ? '0' + dd : dd}`, 'quantity': null, 'concept': null, 'method': null}
}
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
  composite: {display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
    gap: theme.spacing(1), width: "100%"}
}));

function Payments({ children, value, index, title, paymentIds, deletePaymentFromStudent, newPayment, addPaymentId, student_id, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const loading = paymentIds === null;

  const [payments, setPayments] = useState([]);
  const [newPaymentCard, setNewPaymentCard] = useState(false);

  useEffect(() => {
    if (newPayment === 0) {
      setNewPaymentCard(false);
    } else {
      setNewPaymentCard(true);
    }
  }, [newPayment]);

  useEffect(()=>{
    setNewPaymentCard(false);
  }, [payments])

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
        });
  }

  useEffect(() => {
    if (paymentIds === null) return;

    if (paymentIds.length === 0){
      setPayments([]);
    } else {
      PaymentsDataService
            .getSome(paymentIds)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setPayments(res.map(res => res["data"]["data"]).sort((p1, p2) => p1.date.localeCompare(p2.date)));
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

              {newPaymentCard &&
                <PaymentCard payment={getDefaultValues()}
                             updatePayment={updatePayment}
                             deletePayment={(_) => {setNewPaymentCard(false)}}
                            newPayment={true}
                             student_id={student_id}
                addPaymentId={addPaymentId}/>
              }

              {loading &&
                <Skeleton width="100%" height="250px"/>  // todo we can do better
              }

              {!loading && payments.length === 0 && !newPaymentCard &&
                <Typography>{t("no_payments")}</Typography>
              }
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