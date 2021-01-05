import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {Button, DialogActions, MenuItem, TextField} from "@material-ui/core";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import * as yup from 'yup';
import DirtyCountrySelect from "./contry-select.component";
import RestorePageIcon from '@material-ui/icons/RestorePage';
import {useErrorHandler} from "../_helpers/handle-response";
import {useNormik} from "../_helpers/normik";
import SaveIcon from '@material-ui/icons/Save';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import RestoreIcon from '@material-ui/icons/Restore';
import {element} from "prop-types";
import {education_years} from "../_data/education";
import Divider from "@material-ui/core/Divider";

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
    const additionalFields = props.additionalFields;
    const additionalValidation = props.additionalValidation === undefined? {}: props.additionalValidation;

    const {t} = useTranslation();
    const classes = useStyles();
    const errorHandler = useErrorHandler();
    let initialValues = currentPerson === null ? {} : currentPerson;


    const formik = useNormik(true, {
        initialValues: initialValues,
        validationSchema: yup.object({...{
            email: yup.string().email(t("invalid_email")),  // todo
            name: yup.string().required(t("name_required")),
            is_studying: yup.boolean().required(t("studying_required")),
            is_working: yup.boolean().required(t("working_required")),
            career: yup.string().when('is_working', {
                                                  is: true,
                                                  then: yup.string().required(t("career_required"))
                                                }),
            education_entity: yup.string().when('is_studying', {
                                                  is: true,
                                                  then: yup.string().required(t("education_entity_required"))
                                                }),
            education_year: yup.string().when('is_studying', {
                                                  is: true,
                                                  then: yup.string().required(t("education_year_required"))
                                                })
        }, ...additionalValidation}),
        enableReinitialize: true,
        onSubmit: (changedValues, {setStatus, setSubmitting}) => {
            if (Object.keys(changedValues).length > 0) {
                setStatus();
                patchService.patch({
                    id: initialValues["id"],
                    body: changedValues,
                    initial_values: initialValues
                }).then(...errorHandler({snackbarSuccess: true}))
                    .then(function (patched_body) {
                        formik.resetForm(patched_body);
                        updateCurrentPerson(patched_body);
                    }).catch(function (err) {
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

    function recursiveForm(elements) {
        if (elements === undefined) return null;

        return <div>
            <Box my={3}>
            <Divider />
            </Box>
            {
            elements.map(res => (
                <Box className={[classes.line, classes.composite]}>
                    {res instanceof Array ?
                        res.map((r) => (
                            React.cloneElement(r, {formik: formik})
                        ))
                        : React.cloneElement(res, {formik: formik})}
                </Box>))
        }
        </div>;
    }


    return (
        <Box>
            {currentPerson === null
                ?
                (

                    <Box>
                        <Skeleton style={{float: 'right'}}><IconButton/></Skeleton>
                        <Skeleton style={{float: 'right'}}><IconButton/></Skeleton>

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


                        <IconButton style={{float: 'right'}}
                                    onClick={formik.handleReset}
                                    disabled={!formik.dirty || formik.isSubmitting}>
                            <Tooltip title={t("reset")} aria-label={t("reset")}>
                                <RestoreIcon/>
                            </Tooltip>
                        </IconButton>


                        <IconButton style={{float: 'right'}} type="submit"
                                    disabled={!formik.dirty || formik.isSubmitting}>
                            <Tooltip title={t("save")} aria-label={t("save")}>
                                <SaveIcon/>
                            </Tooltip>
                        </IconButton>


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

                       <Box my={3}>
            <Divider />
            </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("address")}
                                formik={formik}
                                style={{flex: 4}}
                                name="address"
                            />
                            <DirtyTextField
                                label={t("city")}
                                style={{flex: 2}}
                                formik={formik}
                                name="city"
                            />
                            <DirtyTextField
                                label={t("zip")}
                                formik={formik}
                                type="number"
                                style={{flex: 1}}
                                name="zip"
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("dni")}
                                style={{flex: 1}}
                                formik={formik}
                                name="dni"
                            />
                            <DirtyTextField
                                label={t("phone")}
                                type="tel"
                                style={{flex: 1}}
                                formik={formik}
                                name="phone"
                            />

                            <DirtyTextField
                                label={t("gender")}
                                style={{flex: 1}}
                                formik={formik}
                                name="gender"
                                select>
                                <MenuItem value="m">{t("male")}</MenuItem>
                                <MenuItem value="f">{t("female")}</MenuItem>
                                <MenuItem value="nb">{t("nb")}</MenuItem>
                            </DirtyTextField>

                        </Box>



                        <Box className={[classes.line, classes.composite]}>

                            <DirtyTextField
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
<Box my={3}>
            <Divider />
            </Box>
                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("is_studying")}
                                style={{flex: 1}}
                                name="is_studying"
                                formik={formik}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                            <DirtyTextField
                                label={t("education_entity")}
                                style={{flex: 2}}
                                formik={formik}
                                name="education_entity"
                            />
                            <DirtyTextField
                                label={t("education_year")}
                                style={{flex: 2}}
                                name="education_year"
                                formik={formik}
                                select>
                                {education_years.map((level) => (
                                    <MenuItem key={level} value={level}>{t(level)}</MenuItem>
                                ))}
                            </DirtyTextField>
                        </Box>

                        <Box className={[classes.line, classes.composite]}>


                            <DirtyTextField
                                label={t("is_working")}
                                style={{flex: 1}}
                                name="is_working"
                                formik={formik}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                            <DirtyTextField
                                label={t("career")}
                                style={{flex: 4}}
                                formik={formik}
                                name="career"
                            />
                        </Box>

                        {recursiveForm(additionalFields)}

                    </form>
                )

            }
        </Box>
    );
}


export default Person;