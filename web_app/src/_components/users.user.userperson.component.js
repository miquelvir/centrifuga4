import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React, {useState} from "react";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
    AppBar,
    Dialog,
    Slide
} from "@material-ui/core";
import InputAdornment from '@material-ui/core/InputAdornment';
import EditIcon from '@material-ui/icons/Edit';
import TeachersDataService from "../_services/teachers.service";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import {IconButtonSkeleton} from "../_skeletons/iconButton";
import {useNeeds} from "../_helpers/needs";
import ItemsListSecondary from "./items_list_secondary.component";
import ItemsListTerciary from "./items_list_terciary.component";
import Skeleton from "@material-ui/lab/Skeleton";
import {MenuItem} from "@material-ui/core";
import * as yup from 'yup';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import UsersDataService from "../_services/users.service";
import {useErrorHandler} from "../_helpers/handle-response";
import DeleteIcon from "@material-ui/icons/Delete";
import DirtyTextField from "./dirtytextfield.component";
import {useNormik} from "../_helpers/normik";
import SaveButton from "./formik_save_button";
import DiscardButton from "./formik_discard_button";
import {safe_email_required} from "../_yup/validators";
import {confirmContext} from "../_context/confirm-context";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const useStyles = makeStyles((theme) => ({
  actionIcon: {
    float: 'right'
  },
  button: {
    margin: theme.spacing(1),
  },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    },
    list: {
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    box: {
        display: "flex",
        flexDirection: "column",
    },
    pagination: {
        margin: '30px'
    },
    appBar: {
    position: 'relative',
  },
  newLine: {
    width: '100%',
       marginTop: theme.spacing(1),
        display: "flex",
    flexDirection: "column"
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  }, actionIcon: {
      float: 'right'
    }
}));


  
function UserPerson({ children, addStudentId, newStudent, title, currentStudent, updateCurrentStudent, patchService, deleteStudent, addNewGuardian, ...other }) {
  const { t } = useTranslation();
  const loading = currentStudent === null;
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const handleAddDialogClose = () => {
        setAddDialogOpen(false);
  };
  const handleAddDialogOpen = () => {
      setAddDialogOpen(true);
  }
const confirm = React.useContext(confirmContext);
const deleteFullUser = () => {
    UsersDataService
              .delete(currentStudent['id'])
              .then(...errorHandler({snackbarSuccess: true}))  // todo everywhere
              .then(function (res) {
                    deleteStudent(currentStudent['id']);
              });
  }


  let initialValues = loading ? {} : currentStudent;


    const formik = useNormik(true, {
        initialValues: initialValues,
        validationSchema: yup.object({
            email: safe_email_required(t),
            name: yup.string().required(t("name_required")),
            role_id: yup.string().nullable()
        }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
                if (Object.keys(changedValues).length > 0) {
                setStatus();

                UsersDataService.patch({
                    id: initialValues["id"],
                    body: changedValues,
                    initial_values: initialValues
                }).then(...errorHandler({snackbarSuccess: true}))
                    .then(function (patched_body) {
                        formik.resetForm(patched_body);
                        updateCurrentStudent(patched_body);
                    }).catch(function (err) {
                        setStatus(true);
                    }).finally(() => {
                        setSubmitting(false);
                    });
            } else {
                setSubmitting(false);
            }
        }
    });
const [hasNeeds, NEEDS] = useNeeds();
  return (
        <Box p={3}>
            <Box px={2}>
                <Dialog fullScreen open={addDialogOpen} onClose={handleAddDialogClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar} color="secondary">
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
                {t("teacher-user")}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleAddDialogClose}>
                {t("cancel")}
            </Button>
          </Toolbar>
        </AppBar>
        <Box className={classes.box} m={3}>
            <ItemsListTerciary
                    dataService={TeachersDataService}
                    dataServiceSR={null}
                    defaultSearchBy="name"
                    searchByOptions={["name"]}
                    searchBarLabel={"teachers"}
                    displayNameField={"name"}
                    secondaryDisplayNameField={null}
                    parent_id={currentStudent === null? null: currentStudent['id']}
                    add_message={"link-user-to-teacher"}
                    onAdded={(id, body) => {
                        handleAddDialogClose();
                        formik.setFieldValue('teacher_id', id);
                        formik.setFieldTouched('teacher_id', true);
                    }}
                />
            </Box>
          </Dialog>

              {loading ?
                  <IconButtonSkeleton className={classes.actionIcon}/>
              :
               hasNeeds([NEEDS.delete]) && <Tooltip style={{float: 'right'}} title={t("delete")} aria-label={t("delete")}>
                <IconButton onClick={(e) => {
                 confirm.confirm("delete_user_question", "not_undone", () => {
                     deleteFullUser();
                 })
                }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              }

              {loading?
                (

                    <Box>
                         <IconButtonSkeleton className={classes.actionIcon}/>
                       <IconButtonSkeleton className={classes.actionIcon}/>


                            <div style={{clear: 'both'}}>
                               {   ["100%", "100%", "100%"].map((value, idx) => {
                                return (
                                    <Box key={idx} py={0} >
                                        <Skeleton variant="text" width={value} height="60px"/>
                                    </Box>);
                            })}
                            </div>
                    </Box>
                )
                :
                (
                    <form onSubmit={formik.handleSubmit}>

                        <DiscardButton className={classes.actionIcon}
                                        formik={formik}/>


                        <SaveButton className={classes.actionIcon}
                                    formik={formik}/>



                        <DirtyTextField
                            label={t("id")}
                            name="id"
                            disabled
                            className={classes.line}
                            formik={formik}
                        />

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("name")}
                                style={{flex: 1}}
                                name="name"
                                formik={formik}
                            />
                            <DirtyTextField
                                label={t("surname1")}
                                style={{flex: 1}}
                                name="surname1"
                                formik={formik}
                            />
                            <DirtyTextField
                                label={t("surname2")}
                                style={{flex: 1}}
                                formik={formik}
                                name="surname2"
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("email")}
                                type="email"
                                style={{flex: 1}}
                                formik={formik}
                                name="email"
                                helperText={formik.touched["email"] && formik.errors["email"]}
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("role")}
                                style={{flex: 1}}
                                name="role_id"
                                formik={formik}
                                select>
                                {[{name: 'administrator',
                                   id: 'administrator'},
                                   {name: 'administrative',
                                   id: 'administrative'},
                                   {name: 'layman',
                                   id: 'layman'},
                                   {name: 'teacher',
                                   id: 'teacher'},
                                   {name: 'empty',
                                   id: 'empty'},
                                   {name: 'no role',
                                   id: null}].map((role) => (
                                    <MenuItem key={role.name} value={role.id}>{t(role.name)}</MenuItem>
                                ))}
                            </DirtyTextField>
                        </Box>

                        {formik.values["role"] == "teacher" && <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("teacher")}
                                style={{flex: 1}}
                                name="teacher_id"
                                formik={formik}
                                disabled
                                InputProps={{endAdornment:
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="link teacher"
                                        onClick={handleAddDialogOpen}
                                      >
                                        <EditIcon></EditIcon>
                                      </IconButton>
                                    </InputAdornment>
                                  }}/>
                        </Box>}

                    </form>
                )

            }

            </Box>
        </Box>

  );
}

export default UserPerson;