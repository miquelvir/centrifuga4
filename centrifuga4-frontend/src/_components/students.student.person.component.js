import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {Button, DialogActions, MenuItem, TextField} from "@material-ui/core";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import * as yup from 'yup';
import DirtyCountrySelect from "./contry-select.component";
import studentsService from "../_services/students.service"
import {useErrorHandler} from "../_helpers/handle-response";
import {useNormik} from "../_helpers/normik";

const useStyles = makeStyles((theme) => ({

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
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    }
}));

function Person(props) {
    const currentPerson = props.currentPerson;
    const patchService = props.patchService;
    const updateCurrentPerson = props.updateCurrentStudent;
    const {t} = useTranslation();
    const classes = useStyles();
    const errorHandler = useErrorHandler();
    let initialValues = currentPerson===null? {}:currentPerson;


    const formik = useNormik(true, {
        initialValues: initialValues,
        validationSchema: yup.object({
                                email: yup.string().email(t("invalid_email")),  // todo
                                name: yup.string().required(t("name_required"))
                            }),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0){
                setStatus();
                    patchService.patch({
                      id: initialValues["id"],
                      body: changedValues,
                      initial_values: initialValues
                  }).then(...errorHandler({snackbarSuccess:true}))
                        .then(function (patched_body) {
                                formik.resetForm(patched_body);
                                updateCurrentPerson(patched_body);
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
        <Box>
            {currentPerson === null
                ?
                (

                    <Box>
                        {
                            ["100%", "100%", "100%", "100%", "100%", "100%"].map((value, idx) => {
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
                                                label={t("name")}
                                                style={{flex: 1}}
                                                name="name"
                                                formik={formik}
                                                helperText={formik.touched["name"] && formik.errors["name"]}
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
                                                label={t("address")}
                                                formik={formik}
                                                style={{flex: 4}}
                                                name="address"
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("city")}
                                                style={{flex: 2}}
                                                formik={formik}
                                                name="city"
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("zip")}
                                                formik={formik}
                                                type="number"
                                                style={{flex: 1}}
                                                name="zip"
                                            />
                                        </Box>

                                        <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("dni")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="dni"
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("phone")}
                                                type="tel"
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="phone"
                                            />

                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("gender")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="gender"
                                                select>
                                                <MenuItem value="m">male</MenuItem>
                                                <MenuItem value="f">female</MenuItem>
                                                <MenuItem value="nb">non binary / not represented by any of the
                                                    above</MenuItem>
                                            </DirtyTextField>

                                        </Box>

                                        <Box className={[classes.line, classes.composite]}>

                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("birthdate")}
                                                formik={formik}
                                                type="date"
                                                style={{flex: 1}}
                                                name="birth_date"
                                                InputLabelProps={{shrink: true}}/>

                                            <DirtyCountrySelect
                                                formik={formik}
                                                name={"country_of_origin"}
                                                label={t("country_of_origin")}
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
    );
}


export default Person;