import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import StudentsList from "./students.list.component";
import Student from "./students.student.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, FormControlLabel, FormGroup, FormHelperText,
    FormLabel,
    TextField,
    Tooltip
} from "@material-ui/core";
import UsersList from "./users.list.component";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import {allNeeds} from "../_data/needs";
import {useNormik} from "../_helpers/normik";
import * as yup from "yup";
import {useFormik} from "formik";
import Typography from "@material-ui/core/Typography";
import {invitationsService} from "../_services/userInvites.service";
import {useErrorHandler} from "../_helpers/handle-response";

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


export default function Users({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentUserId(id);
  }, [id]);
  const errorHandler = useErrorHandler();

  const formik = useFormik({
        initialValues: {...Object.assign({}, ...allNeeds.map((x) => ({[x.name]: true}))),
                        email: ''},
        validationSchema: yup.object({
            email: yup.string().required(t("email_required")).email(t("invalid_email"))}),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setSubmitting(true);
            invitationsService
                .inviteUser(values['email'], allNeeds.map(n => (n.name)).filter(name => values[name]))
                .then(...errorHandler({}))
                .then(res => {
                    handleClose();
                }).catch(_ => {
                    setStatus(true);
                }).finally(() => {
                    setSubmitting(false);
            })
        }
    });

  return (
      <Grid container spacing={3} className={classes.root}>
          <Dialog  open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
            {t("invite_user")}
        </DialogTitle> <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            name="email"
            label={t("email")}
            type="email"
            fullWidth
            value={formik.values['email']}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.status  || formik.errors['email'] !== undefined}
            helperText={formik.touched['email'] && formik.errors['email']}
          />
          <Box my={2} className={classes.dialog}>

                  <Typography>{t("permissions")}</Typography>
                  {allNeeds.map(need => (
                    <FormControlLabel
                        control={
                            <Checkbox
                            checked={formik.values[need.name]}
                            name={need.name}
                            value={formik.values[need.name]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            />
                        }
                        key={need.name}
                        label={t(need.description)}
                      />))}

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
              {t("cancel")}
          </Button>
          <Button type="submit" color="primary" disabled={formik.isSubmitting}>
              {t("invite")}
          </Button>
        </DialogActions></form>
      </Dialog>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("users")}</h1>
          <UsersList
            setCurrentUserId={setCurrentUserId}
            currentUserId={currentUserId}
            users={users}
            setUsers={setUsers}

          />
          <Tooltip title={t("new_user")}>
              <Fab className={classes.fab} color="primary" onClick={handleClickOpen}>
                <PersonAddIcon />
              </Fab>
          </Tooltip>
        </Grid>

        <Grid item xs={8} className={classes.right}>
          <Student
            currentStudentId={currentUserId}
            history={history}
            deleteUser={(userId) => {
                if (userId === currentUserId) setCurrentUserId(null);

                setUsers(users.filter((s) => s['id'] !== userId));
            }}
          />
        </Grid>
      </Grid>
  );
}
