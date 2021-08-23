import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Fab from "@material-ui/core/Fab";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Tooltip
} from "@material-ui/core";
import RoleSelect from './user.role-select.component';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import * as yup from "yup";
import {useFormik} from "formik";
import {invitationsService} from "../_services/userInvites.service";
import {useErrorHandler} from "../_helpers/handle-response";
import User from "./users.user.component";
import UsersDataService from "../_services/users.service";
import {useNeeds} from "../_helpers/needs";
import {safe_email_required} from "../_yup/validators";
import ItemsListMain from "./items_list_main.component";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
    root2: {
    display: 'flex',
  },
  line: {
    width: "100%",
    marginTop: theme.spacing(1)
  },
  composite: {
      display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
      gap: theme.spacing(1), width: "100%"
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

export default function Users({...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [open, setOpen] = React.useState(false);
    const [hasNeeds, NEEDS] = useNeeds();

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
        initialValues: {email: '', needs: []},
        validationSchema: yup.object({
            email: safe_email_required(t)}),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setSubmitting(true);
            invitationsService
                .inviteUser(values['email'], values['role_id'])
                .then(...errorHandler({snackbarSuccess: true}))
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
              </DialogTitle> 
              <form onSubmit={formik.handleSubmit}>
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
                    <Box className={[classes.line, classes.composite]}>
                      <RoleSelect formik={formik}/>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                      {t("cancel")}
                  </Button>
                  <Button type="submit" color="primary" disabled={formik.isSubmitting}>
                      {t("invite")}
                  </Button>
                </DialogActions>
              </form>
          </Dialog>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("users")}</h1>
          <ItemsListMain
                setCurrentItemId={setCurrentUserId}
                currentItemId={currentUserId}
                items={users}
                setItems={setUsers}
                defaultSearchBy="full_name"
                searchByOptions={["full_name", "id"]}
                dataService={UsersDataService}
                searchBarLabel="users"
            />
            {hasNeeds([NEEDS.invite_users]) && <Tooltip title={t("new_user")}>
                <Fab className={classes.fab} color="primary" onClick={handleClickOpen}>
                    <PersonAddIcon/>
                </Fab>
            </Tooltip>}
        </Grid>

        <Grid item xs={8} className={classes.left}>
          <User
            currentUserId={currentUserId}
            deleteUser={(userId) => {
                if (userId === currentUserId) setCurrentUserId(null);

                setUsers(users.filter((s) => s['id'] !== userId));
            }}
          />
        </Grid>
      </Grid>
  );
}
