import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import {Button, DialogActions, MenuItem, TextField} from "@material-ui/core";
import countryList from "../_data/countries";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Autocomplete, Skeleton} from "@material-ui/lab";
import DirtyTextField from "./dirtytextfield.component";
import {useFormik,} from 'formik';
import * as yup from 'yup';
import countries from "../_data/countries";
import ContrySelect from "./contry-select.component";
import CountrySelect from "./contry-select.component";


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
    const {t} = useTranslation();
    const loading = false;
    const classes = useStyles();

    const formik = useFormik({
        initialValues: currentPerson===null? {}:currentPerson,
        validationSchema: yup.object({
                                email: yup.string().email('Enter a valid email.'),  // todo
                                name: yup.string().required('Required')
                            }),
        enableReinitialize: true,
        onSubmit: (values) => {
          alert(JSON.stringify(values, null, 2));
        }
    });

    return (
        <Box>
            {loading || currentPerson === null
                ?
                (

                    <Box>
                        {
                            ["100%", "100%", "100%", "100%", "100%", "100%"].map(value => {
                                return (
                                    <Box py={0}><Skeleton variant="text" width={value} height="60px"></Skeleton></Box>);
                            })
                        }
                    </Box>
                )
                :
                (
                        <form onSubmit={formik.handleSubmit}>
                                        <TextField
                                            label={t("id")}
                                            name="id"
                                            disabled
                                            className={classes.line}
                                            value={formik.values["id"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            />

                                        <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                label={t("name")}
                                                style={{flex: 1}}
                                                name="name"
                                                value={formik.values["name"]}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                formik={formik}
                                                helperText={formik.touched["name"] && formik.errors["name"]}
                                            />
                                            <DirtyTextField
                                                label={t("surname1")}
                                                style={{flex: 1}}
                                                name="surname1"
                                                formik={formik}
                                                value={formik.values["surname1"]}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <DirtyTextField
                                                label={t("surname2")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="surname2"
                                                value={formik.values["surname2"]}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                        </Box>

                                    <Box className={[classes.line, classes.composite]}>
                                        <DirtyTextField
                                            label={t("email")}
                                            type="email"
                                            style={{flex: 1}}
                                                formik={formik}
                                            name="email"
                                            value={formik.values["email"]}
                                            helperText={formik.touched["email"] && formik.errors["email"]}
                                            error={formik.errors["email"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </Box>

                                        <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                label={t("address")}
                                                formik={formik}
                                                style={{flex: 4}}
                                                name="address"
                                                value={formik.values.address}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("city")}
                                                style={{flex: 2}}
                                                formik={formik}
                                                name="city"
                                            value={formik.values.city}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("zip")}
                                                formik={formik}
                                                type="number"
                                                style={{flex: 1}}
                                                name="zip"
                                            value={formik.values["zip"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            />
                                        </Box>

                                        <Box className={[classes.line, classes.composite]}>
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("dni")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="dni"
                                            value={formik.values["dni"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            />
                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("phone")}
                                                type="tel"
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="phone"
                                            value={formik.values["phone"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            />

                                            <DirtyTextField
                                                id="standard-basic"
                                                label={t("gender")}
                                                style={{flex: 1}}
                                                formik={formik}
                                                name="gender"
                                            value={formik.values["gender"] === null? '': formik.values["gender"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
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
                                            value={formik.values["birth_date"]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                                InputLabelProps={{shrink: true}}/>

                                            <CountrySelect formik={formik}/>

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
                                            <Button type="submit" disabled={formik.isSubmitting}>
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