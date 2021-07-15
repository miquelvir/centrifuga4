import React, {useEffect, useRef, useState} from 'react';
import * as yup from 'yup';
import {
    BottomNavigation,
    Card, CardActions,
    Checkbox,
    FormControlLabel, ListItemIcon, ListItemSecondaryAction,
    MenuItem, MobileStepper,
    Step,
    StepLabel,
    Stepper, Tooltip, withStyles
} from "@material-ui/core";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import {useTranslation} from "react-i18next";
import {makeStyles} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {themeContext} from "../_context/theme-context";
import {useSnackbar} from "notistack";
import i18next from "i18next";
import {useErrorHandler} from "../_helpers/handle-response";
import {useOnMount} from "../_helpers/on-mount";
import ReCAPTCHA from "react-google-recaptcha"
import DirtyTextField from "../_components/dirtytextfield.component";
import Divider from "@material-ui/core/Divider";
import DirtyCountrySelect from "../_components/contry-select.component";
import {education_years} from "../_data/education";
import {emptyAttendee} from "../_data/empty_objects";
import {useNormik} from "../_helpers/normik";
import IconButton from "@material-ui/core/IconButton";
import {student_guardian_relations} from "../_data/relations";
import SearchBar from "../_components/searchbar.component";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import CardContent from "@material-ui/core/CardContent";
import DeleteIcon from "@material-ui/icons/Delete";
import {PUBLIC_URL, RECAPTCHA} from "../config";
import ThemeButton from "../_components/theme_button.component";
import Link from "@material-ui/core/Link";
import TranslateButton from "../_components/translate_button.component";
import {preEnrolmentService} from "../_services/pre-enrolment.service";
import {safe_email, safe_email_required} from "../_yup/validators";
import {KeyboardArrowLeft, KeyboardArrowRight} from "@material-ui/icons";
import useTheme from "@material-ui/core/styles/useTheme";
import DoneIcon from '@material-ui/icons/Done';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%"
    },
    field: {
        width: "100%",
        margin: "5px"
    },
    cards: {
        '& > *': {
            margin: theme.spacing(3),
        },
    },
    buttons: {
        '& > *': {
            margin: theme.spacing(1),
        },
    }, line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    card: {
    minWidth: 200,
        width: 'fit-content',
        maxWidth: 500,
        display: 'inline-block'
  },
    recaptcha: {
        margin: theme.spacing(4)
    },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
    list: {
        minHeight: '150px',
        overflow: 'auto'
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    }
}));

function getNextDayOfWeek(date, dayOfWeek) {
    // Code to check that date and dayOfWeek are valid left as an exercise ;)

    var resultDate = new Date(date.getTime());

    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

    return resultDate;
}

const getLocalisedWeekday = (dayOfWeek) => {
    let today = new Date();
    let nextDayOfWeek = getNextDayOfWeek(today, dayOfWeek);
    return nextDayOfWeek.toLocaleString(window.navigator.language, {weekday: 'short'});
}

const isUnderage = (birthDateString) => {
    let today = new Date();
    let birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age < 18;
}
const PreEnrolmentPage = (props) => {
    const {t} = useTranslation();

    const can_pay_60 = "Puc pagar la quota trimestral de 60€/estudiant";
     const can_pay_50 =   "Puc pagar una quota trimestral de 50€/estudiant";
     const can_pay_40 =  "Puc pagar una quota trimestral de 40€/estudiant";

    const classes = useStyles();


    const [recaptcha, setRecaptcha] = React.useState(null);
    function onChange(value) {
      setRecaptcha(value);
    }




    const {enqueueSnackbar} = useSnackbar();
    const [skipped, setSkipped] = React.useState(new Set());
    const [availableCourses, setAvailableCourses] = React.useState([]);
    const [filteredCourses, setFilteredCourses] = React.useState([]);
    const [chosenCourses, setChosenCourses] = React.useState([]);
    const [raw_economic_comments, setRawEconomicComments] = React.useState([]);
   const isStepSkipped = (step) => {
    return skipped.has(step);
  };

    const [activeStep, setActiveStep] = React.useState(0);
      const steps = [t("data_protection"), t("student_info"), t("contact_person_1"), t("contact_person_2"), t("courses"), t("payment"), t("confirmation")];

    const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };
      const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
      };

      const handleReset = () => {
        setActiveStep(0);
      };

      useOnMount(() => {
          i18next.changeLanguage('cat').then();  // set catalan for all visiting families as default
         preEnrolmentService.getCourses()
             .then(...errorHandler({}))
             .then(courses => {
                 setAvailableCourses(courses);
                 setFilteredCourses(courses);
             })
      });

      const theme = useTheme();


      const [searchTerm, setSearchTerm] = useState('');

    const errorHandler = useErrorHandler();
    const required = t("required");
    const formik = useNormik(false,{
        initialValues: {...emptyAttendee,
            __person1__name: '', __person2__name: '',
__person1__surname1: '',
            __person1__surname2: '',
            __person1__email: '', __person1__phone: '', __person1__relation: '',
            __person1__is_studying: '', __person1__is_working: '', __person1__career: '',
            __person1__education_entity: '', __person1__education_year: '',
            __person2__surname1: '',
            __person2__surname2: '',
            __person2__email: '', __person2__phone: '', __person2__relation: '',
            __person2__is_studying: '', __person2__is_working: '', __person2__career: '',
            __person2__education_entity: '', __person2__education_year: '',
            image_agreement: false


        },
        validationSchema: yup.object({  // todo translate
            name: yup.string(required).required(required),
            surname1: yup.string(required).required(required),
            surname2: yup.string(required).required(required),
            email: safe_email(t).when('birth_date', (other, schema) => ((other && !isUnderage(other))? schema.required(required): schema)),
            phone: yup.string().when('birth_date', (other, schema) => ((other && !isUnderage(other))? schema.required(required): schema)),
            address: yup.string(required).required(required),
            city: yup.string(required).required(required),
            zip: yup.number(required).required(required),
            dni: yup.string(required).matches(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i , "format de DNI invàlid"),
            country_of_origin: yup.string(required).notOneOf(['empty']).test(  // one of the array
                                  'countryNonEmpty',
                                  required,
                                  v =>  v !== undefined
                                ),
            gender: yup.string(required).required(required),
            is_studying: yup.boolean(required).required(required),
            is_working: yup.boolean(required).required(required),
            career: yup.string(required).when('is_working', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            education_entity: yup.string(required).when('is_studying', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            education_year: yup.string(required).when('is_studying', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            birth_date: yup.date(required).required(required),
            years_in_xamfra: yup.number(required).required(required),
            __person1__name: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => {
                                      return v !== undefined && v !== "" || isStepSkipped(2)
                                  }
                                ),
            __person1__surname1: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>  v !== undefined && v !== ""|| isStepSkipped(2)
                                ),
            __person1__surname2: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== "" || isStepSkipped(2)
                                ),
            __person1__email: safe_email(t).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>v !== undefined && v !== ""||  isStepSkipped(2)
                                ),
            __person1__phone: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>v !== undefined && v !== "" || isStepSkipped(2)
                                ),
            __person1__relation: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== ""|| isStepSkipped(2)
                                ),
            __person1__is_studying: yup.boolean(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== "" ||  isStepSkipped(2)
                                ),
            __person1__is_working: yup.boolean(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== ""|| isStepSkipped(2)
                                ),
            __person1__career: yup.string(required).when('__person1__is_working', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            __person1__education_year: yup.string(required).when('__person1__is_studying', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            __person2__name: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>v !== undefined && v !== "" || isStepSkipped(3)
                                ),
            __person2__surname1: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== "" || isStepSkipped(3)
                                ),
            __person2__surname2: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>  v !== undefined && v !== ""|| isStepSkipped(3)
                                ),
            __person2__email: safe_email(t).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== "" || isStepSkipped(3)
                                ),
            __person2__phone: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>  v !== undefined && v !== ""|| isStepSkipped(3)
                                ),
            __person2__relation: yup.string(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>v !== undefined && v !== ""|| isStepSkipped(3)
                                ),
            __person2__is_studying: yup.boolean(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v =>  v !== undefined && v !== "" || isStepSkipped(3)
                                ),
            __person2__is_working: yup.boolean(required).test(  // one of the array
                                  'requiredIfNotSkipped',
                                  required,
                                  v => v !== undefined && v !== "" || isStepSkipped(3)
                                ),
            __person2__career: yup.string(required).when('__person2__is_working', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            __person2__education_entity: yup.string(required).when('__person2__is_studying', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            __person2__education_year: yup.string(required).when('__person2__is_studying', {
                                                  is: true,
                                                  then: yup.string().required(required)
                                                }),
            image_agreement: yup.boolean(required)
        }),
        enableReinitialize: true,
        onSubmit: (values, {setStatus, setSubmitting}) => {
            setStatus();

            let body = {};

            body['image_agreement'] = values.image_agreement;
            body['name'] = values.name;
            body['surname1'] = values.surname1;
            body['surname2'] = values.surname2;
            body['email'] = values.email;
            body['address'] = values.address;
            body['city'] = values.city;
            body['zip'] = values.zip;
            body['dni'] = values.dni;
            body['phone'] = values.phone;
            body['country_of_origin'] = values.country_of_origin;
            body['gender'] = values.gender;
            body['is_studying'] = values.is_studying;
            body['is_working'] = values.is_working;
            body['education_entity'] = values.education_entity;
            body['education_year'] = values.education_year;
            body['career'] = values.career;
            body['birth_date'] = values.birth_date;
            body['years_in_xamfra'] = values.years_in_xamfra;
            body['guardians'] = [];
            [2,3].map(idx => {
                if (!isStepSkipped(idx)){
                    let guardian = {};
                    const prefix = `__person${idx-1}__`;
                    guardian['name'] = values[prefix+"name"];
                    guardian['surname1'] = values[prefix+"surname1"];
                    guardian['surname2'] = values[prefix+"surname2"];
                    guardian['email'] = values[prefix+"email"];
                    guardian['phone'] = values[prefix+"phone"];
                    guardian['is_studying'] = values[prefix+"is_studying"];
                    guardian['is_working'] = values[prefix+"is_working"];
                    guardian['education_entity'] = values[prefix+"education_entity"];
                    guardian['career'] = values[prefix+"career"];
                    guardian['relation'] = values[prefix+"relation"];

                    body['guardians'].push(guardian);
                }
            })
            body['payment_comments'] = raw_economic_comments.join('. ');
            if (raw_economic_comments.includes(can_pay_40)){
                body['price_term'] = 40;
            } else if (raw_economic_comments.includes(can_pay_50)){
                body['price_term'] = 50;
            } else if (raw_economic_comments.includes(can_pay_60)){
                body['price_term'] = 60;
            } else {
                body['price_term'] = null;
            }
            body['other_comments'] = values['other_comments'];
            body['courses'] = chosenCourses.map(x => x.id);

            setSubmitting(false);

            preEnrolmentService.postPreEnrollment(body, recaptcha)
                .then(...errorHandler({snackbarSuccess: true}))
                .then(() => {
                    setActiveStep(steps.length);
                })
        }
    });

 useEffect(() => {
          let labels = [];
          if (!isUnderage(formik.values['birth_date']) || formik.values['is_working'] ){
              labels.push("adult");
          }
          if (formik.values['is_studying']){
              labels.push(formik.values['education_year']);
          }

          setFilteredCourses(availableCourses.filter(x => labels.some(l => x['labels'].includes(l))));

      }, [availableCourses, formik.values['education_year'], formik.values['birth_date']]);


    const isStepOptional = (step) => {
    return step === 3 || (step === 2  && formik.values['birth_date'] !== '' && !isUnderage(formik.values['birth_date']));
  };
    const fieldsToValidatePerStep = [  // to have coinciding indexes with steps
        [],
    ['birth_date', 'name', 'surname1', 'surname2', 'address', 'city', 'zip', 'gender', 'is_studying', 'is_working', 'education_entity', 'education_year', 'career', 'years_in_xamfra', 'country_of_origin', 'phone', 'email'],
        ['__person1__name', '__person1__surname1', '__person1__surname2', '__person1__email', '__person1__phone', '__person1__phone', '__person1__relation', '__person1__is_studying', '__person1__education_entity', '__person1__education_year', '__person1__is_working', '__person1__career'],
        ['__person2__name', '__person2__surname1', '__person2__surname2', '__person2__email', '__person2__phone', '__person2__phone', '__person2__relation', '__person2__is_studying', '__person2__education_entity', '__person2__education_year', '__person2__is_working', '__person2__career'],
    [], [], ['image_agreement'], []];

    const scrollToTop = () => {
        window.scrollTo(0,0);
    }

    const textSchedulesForCourse = (course) => {
        if (!course["base_schedules"]) return null;
        return course["base_schedules"].map(s => getLocalisedWeekday(s.day_week) + ", " + s.start_time.slice(0, -3) + " - " + s.end_time.slice(0, -3)).join("; ");
    }

const handleNext = () => {
        formik.setFieldTouched('');


            let newSkipped = skipped;
            if (isStepSkipped(activeStep)) {
              newSkipped = new Set(newSkipped.values());
              newSkipped.delete(activeStep);
            }

            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);

            scrollToTop();


      };

    const secondaryListItemTextForCourse = (course) => {
        const schedules = textSchedulesForCourse(course);
        const description = course['description'];
        if (!description && !schedules) return null;
        if (description && schedules) return description + " · " + schedules;
        if (!description) return schedules;
        if (!schedules) return description;
    }


    const themeCtx = React.useContext(themeContext);
    const canNotGoNext = (activeStep === steps.length - 1)
        || !fieldsToValidatePerStep[activeStep].every(f => (!formik.errors[f]))
            || (activeStep === steps.length - 3 && chosenCourses.length === 0);

    const courseToListItem = (course) =>
        <Box><ListItem key={course["id"]} button alignItems="flex-start"
                                  onClick={() => {
                                        if (chosenCourses.includes(course)) {
                                            setChosenCourses(chosenCourses.filter(x => x.id !== course.id));
                                        } else {
                                            setChosenCourses([...chosenCourses, course]);
                                        }
                                  }}>
            <ListItemIcon>
                <Checkbox
                    edge="start"
                    disableRipple
                    tabIndex={-1}
                    checked={chosenCourses.includes(course)}
                    onChange={ () =>  {}}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
            </ListItemIcon>


                            <ListItemText id="description"
                                          primary={course['name']}
                                          secondary={secondaryListItemTextForCourse(course)}/>

                        </ListItem>
                        <Divider/></Box>;



    return (
        <Box>
        <Box p={2} style={{width: '100%'}}>
             <TranslateButton style={{float: 'right'}}/>
                <ThemeButton style={{float: 'right'}}/>

            <Box mx={2} style={{textAlign: "left"}}>
        <img src={ `${PUBLIC_URL}/logo_xamfra_${themeCtx.label}.png`} alt="Logo Xamfrà"
             style={{height: "35px"}}/>
            </Box>
        </Box>
                    <div>


     <Box marginBottom={2}>
            <Divider />
            </Box>
        {activeStep === steps.length ? (
          <div style={{textAlign:"center"}}>
            <Box>
                Prematrícula completada amb èxit!<br/>
                ¡Prematrícula completada con éxito!<br/>
                Pre-enrolment successful!
            </Box>
              <Box m={4}>
              <CheckCircleIcon fontSize="large"
                               style={{ color: theme.palette.neutral.status.success }}/></Box>
          </div>
        ) : (
             <form onSubmit={formik.handleSubmit}>
          <Box p={2}>
              <div>
                  {activeStep === 0 &&
                  <div>
                      <Typography>
                          Podeu consultar el quadre horari del curs 20-21 <Link target="_blank" href="https://xamfra.net/com-participar-hi/horaris/">aquí</Link>.
                      </Typography>
                      <br/>
                      <Typography variant={"caption"}>
Enviar aquest formulari implica consentiment per fer ús de les dades per tal de rebre informació durant el període de preinscripció i inici de curs.

La posterior matrícula presencial al centre implica també l'ús de les dades durant tot el curs 2021-2022.

La nostra política protecció de dades es basa en que:

1) El Responsable del Tractament de les teves dades personals és de Xamfrà, Centre de Música i Escena del Raval (Fundació l'ARC Música)
2) Les finalitats del tractament de les dades personals és la de gestionar la teva vinculació amb Xamfrà. La base de dades disposa de noms, telèfons, adreça postal i adreça electrònica.
3) Les teves dades no seran comunicades a tercers sense previ consentiment.
4) Pots exercir els drets d'accés, rectificació i oposició segons preveu a la normativa.
            </Typography>

                  </div>
                  }





                  {activeStep === 1 &&
                  <div>
                      <Typography variant="h4">{t("student")}</Typography>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("name")}
                                style={{flex: 1}}
                                name="name"
                                autocomplete="name given-name"
                                formik={formik}
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("surname1")}
                                style={{flex: 1}}
                                name="surname1"
                                formik={formik}
                                autocomplete="name additional-name"
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("surname2")}
                                style={{flex: 1}}
                                formik={formik}
                                name="surname2"
                                autocomplete="name family-name"
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>

                                <DirtyTextField
                                label={t("birthdate")}
                                type="date"
                                style={{flex: 1}}
                                noDirty={true}
                                formik={formik}
                                name="birth_date"
                                autoComplete="bday"
                                InputLabelProps={{shrink: true}}/>
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("email")}
                                type="email"
                                style={{flex: 1}}
                                formik={formik}
                                name="email"
                                noDirty={true}
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
                                noDirty={true}
                                autocomplete="street-address"
                                style={{flex: 4}}
                                name="address"
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("city")}
                                style={{flex: 2}}
                                formik={formik}
                                noDirty={true}
                                name="city"
                                autoComplete="address-level2"
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("zip")}
                                formik={formik}
                                type="number"
                                autoComplete="postal-code"
                                noDirty={true}
                                style={{flex: 1}}
                                name="zip"
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("dni")}
                                style={{flex: 1}}
                                noDirty={true}
                                formik={formik}
                                name="dni"
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("phone")}
                                type="tel"
                                style={{flex: 1}}
                                formik={formik}
                                noDirty={true}
                                name="phone"
                            />
                        </Box>


                      <Box className={[classes.line, classes.composite]}>
                            <DirtyCountrySelect
                                formik={formik}
                                style={{flex: 1}}
                                noDirty={true}
                                name={"country_of_origin"}
                                label={t("country_of_origin")}
                                autoComplete="country"
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("gender")}
                                style={{flex: 1}}
                                formik={formik}
                                noDirty={true}
                                name="gender"
                                select>
                                <MenuItem value="m">{t("m")}</MenuItem>
                                <MenuItem value="f">{t("f")}</MenuItem>
                                <MenuItem value="nb">{t("nb")}</MenuItem>
                            </DirtyTextField>
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
                                noDirty={true}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("education_entity")}
                                style={{flex: 2}}
                                formik={formik}
                                name="education_entity"
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("education_year")}
                                style={{flex: 2}}
                                noDirty={true}
                                name="education_year"
                                formik={formik}
                                select>
                                {education_years.map((level) => (
                                    <MenuItem key={level} value={level}>{t(level)}</MenuItem>
                                ))}
                            </DirtyTextField>
                        </Box>

                      <Box my={3}>
                        <Divider />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>


                            <DirtyTextField
                                label={t("is_working")}
                                style={{flex: 1}}
                                name="is_working"
                                formik={formik}
                                noDirty={true}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                        </Box>

                      <Box className={[classes.line, classes.composite]}>

                            <DirtyTextField
                                label={t("career")}
                                style={{flex: 4}}
                                formik={formik}
                                noDirty={true}
                                name="career"
                            />
                        </Box>

                         <Box my={3}>
                        <Divider />
                        </Box>



                      <Box className={[classes.line, classes.composite]}>

                            <DirtyTextField
                              label={t("years_in_xamfra")}
                              type="number"
                              noDirty={true}
                              formik={formik}
                              style={{flex: 1}}
                              name="years_in_xamfra"/>
                        </Box>



                  </div>
                  }


                  {(activeStep === 2 || activeStep === 3) &&
                  <div>
                      <Typography variant="h4">{t("contact") + " " + (activeStep - 1)}</Typography>
                      {isStepOptional(activeStep) && <Tooltip title={t("skip")}>
                          <Box my={2}><Button
                              size="medium"
                              onClick={handleSkip}
                              variant="contained"
                              aria-label={t("skip")}
                              startIcon={<SkipNextIcon/>}
                              color="primary"
                              disabled={!isStepOptional(activeStep)}>
                              {t("skip")}
                          </Button></Box></Tooltip>}

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("name")}
                                style={{flex: 1}}
                                name={"__person" + (activeStep-1) + "__name"}
                                formik={formik}
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("surname1")}
                                style={{flex: 1}}
                                name={"__person" + (activeStep-1) + "__surname1"}
                                formik={formik}
                                noDirty={true}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("surname2")}
                                style={{flex: 1}}
                                formik={formik}
                                name={"__person" + (activeStep-1) + "__surname2"}
                                noDirty={true}
                            />
                        </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("email")}
                                type="email"
                                style={{flex: 1}}
                                formik={formik}
                                name={"__person" + (activeStep-1) + "__email"}
                                noDirty={true}
                                helperText={formik.touched["email"] && formik.errors["email"]}
                            />
                        </Box>

                       <Box my={3}>
            <Divider />
            </Box>

                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("phone")}
                                type="tel"
                                style={{flex: 1}}
                                formik={formik}
                                noDirty={true}
                                name={"__person" + (activeStep-1) + "__phone"}
                            />
                        </Box>

                      <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("relation")}
                                style={{flex: 1}}
                                name={"__person" + (activeStep-1) + "__relation"}
                                select
                                noDirty={true}
                                formik={formik}
                            >
                          {student_guardian_relations.map((r) => (
                                   <MenuItem key={r} value={r}>{t(r)}</MenuItem>
                                ))}
                                ))}
                        </DirtyTextField>
                        </Box>


            <Box my={3}>
            <Divider />
            </Box>
                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("is_studying")}
                                style={{flex: 1}}
                                name={"__person" + (activeStep - 1) + "__is_studying"}
                                formik={formik}
                                noDirty={true}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                        </Box>

                       <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("education_entity")}
                                style={{flex: 4}}
                                formik={formik}
                                name={"__person" + (activeStep-1) + "__education_entity"}
                                noDirty={true}
                            />
                        </Box>

                       <Box my={3}>
            <Divider />
            </Box>

                        <Box className={[classes.line, classes.composite]}>


                            <DirtyTextField
                                label={t("is_working")}
                                style={{flex: 1}}
                                name={"__person" + (activeStep-1) + "__is_working"}
                                formik={formik}
                                noDirty={true}
                                select>
                                <MenuItem value={true}>{t("yes")}</MenuItem>
                                <MenuItem value={false}>{t("no")}</MenuItem>
                            </DirtyTextField>
                        </Box>


                        <Box className={[classes.line, classes.composite]}>
                            <DirtyTextField
                                label={t("career")}
                                style={{flex: 4}}
                                formik={formik}
                                noDirty={true}
                                name={"__person" + (activeStep-1) + "__career"}
                            />
                        </Box>




                  </div>
                  }

    {activeStep === 4 &&
    <div>

        {/*<Box className={classes.cards}>
            {chosenCourses && chosenCourses.map(course => (
                <Card className={classes.card} raised={true}>
                    <CardContent>

                        <Typography variant="h5" component="h2">
                            {course['name']}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                            {course['description'] ? course['description'] : "..."}
                        </Typography>
                        {course['base_schedules'] && course['base_schedules'].map(s => (
                            <Typography variant="body2" component="p">
                                {getLocalisedWeekday(s.day_week)}, {s.start_time.slice(0, -3)} - {s.end_time.slice(0, -3)}
                            </Typography>
                        ))}


                    </CardContent>
                    <CardActions>
                        <IconButton size="small" onClick={() => {
                            setChosenCourses(chosenCourses.filter(c => (c !== course)))
                        }}><DeleteIcon/></IconButton>
                    </CardActions>
                </Card>
            ))}
        </Box>*/}


                <SearchBar
                    label={t("courses")}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    onSearch={() => {}}
                />
            <List className={classes.list}>
                {filteredCourses && filteredCourses.filter(x =>
                    (x.name.includes(searchTerm) || (x.description !== null && x.description.includes(searchTerm)))).map((course) => (
                    <div key={course["id"]}>
                        {courseToListItem(course)}
                    </div>
                ))}
            </List>
             {filteredCourses.length === 0 &&
                <Typography>{t("no_courses_found_add_edu")}</Typography>
             }
    </div>}

  {activeStep === 5 &&
      <div>
          <Box fontWeight={500} my={2}>
              Xamfrà és un centre que treballa perquè tots els infants i joves puguin fer música, teatre i dansa. Les famílies aporten el que poden per ajudar a fer sostenible el centre. En cap cas, la quota cobreix el cost dels tallers que fan els nens i nenes. Marqueu, si us plau, una o vàries opcions.
              <br/><br/>
              CAP INFANT O JOVE HA DE DEIXAR DE FER TEATRE, MÚSICA O DANSA A XAMFRÀ PER MOTIUS ECONÒMICS.
              <br/><br/>
              A qui no pugui, l'ajudarem; i qui pugui ajudar: moltes gràcies!
          </Box>

          <List className={classes.list}>
                {
              [can_pay_60,
              can_pay_50,
              can_pay_40,
              "Puc pagar una quota a acordar personalment",
              "No puc pagar la quota trimestral",
              "Puc aportar una segona quota per un altre nen/a (desgravació fiscal)",
              "Puc fer-me teamer (1 €/mes)",
              "Puc fer donatius puntuals (desgravació fiscal)",
              "Puc fer donatius regulars (desgravació fiscal)",
              "Puc ajudar en tasques puntuals",
              "Puc ajudar a la Campanya RISUONA (donació d'instruments)",
              "Puc fer serveis professionals relacionats amb els meus estudis o professió"].map(option => (
                  <Box><ListItem key={option} alignItems="flex-start">
                      <ListItemText id="description"
                                          primary={option}/>
                      <ListItemSecondaryAction>

                      <Checkbox
                    edge="start"
                    disableRipple
                    tabIndex={-1}
                    onChange={(event, checked) => {
                        if (checked) {
                            raw_economic_comments.push(option);
                        } else {
                            setRawEconomicComments( raw_economic_comments.filter((x) => x !== option));
                        }

                        }
                    }
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />

                  </ListItemSecondaryAction>



                        </ListItem>
                        <Divider/></Box>

              ))
          }
            </List>


      </div>
               }

               {activeStep === 6 &&
      <div>
          <Box className={[classes.line, classes.composite]}>
                             <DirtyTextField
                                label={t("other_comments")}
                                style={{flex: 1}}
                                multiline
                                formik={formik}
                                rowsMax={8}
                                noDirty={true}
                                name="other_comments"
                            />
                        </Box>
          <Box my={2}>
          <FormControlLabel
                        control={
                            <Checkbox
                                defaultValue={false}
                                defaultChecked={false}
                                checked={formik.values['image_agreement']}
                                name={'image_agreement'}
                                value={formik.values['image_agreement']}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        }
                        key={'image_agreement'}
                        label={isUnderage(formik.values['birth_date'])?
                        "En cas de matricular-lo, autoritzo l’ús de la imatge de l’estudiant, menor d'edat, per a que pugui aparèixer a materials escrits o multimèdia corresponents a activitats educatives organitzades per Xamfrà."
                        : "En cas de matricular-me, autoritzo l’ús de la meva imatge per a que pugui aparèixer a materials escrits o multimèdia corresponents a activitats educatives organitzades per Xamfrà." }
                      />
</Box>
          <Box textAlign="center">
                      <ReCAPTCHA sitekey={RECAPTCHA}
                                 onChange={onChange}
                                 theme={themeCtx.theme? "dark": "light"}
                                 className={classes.recaptcha}
                                 style={{
                                     display: "inline-block",
                                     margin: "0 auto",
  width: "fit-content"
                                 }}
                      />
              </Box>
      </div>
               }

              </div>


              </Box>

<Box py={5}/>
<BottomNavigation
  showLabels
  style={{
      position: 'fixed',
    bottom: 0,
      width: '100%'
  }}
>
  <MobileStepper
                          variant="dots"
                          steps={steps.length}
                          position="static"
                          style={{
                              width:"100%",
                              margin: 0,
                              backgroundColor: theme.palette.primary.light,
                          }}
                          color={theme.palette.primary.contrastText}
                          activeStep={activeStep}
                          nextButton={
                              <Box>
{activeStep !== steps.length -1 &&
    <Box>
                            <Tooltip title={t("next")}><IconButton size="small"
                                    onClick={handleNext}
                                    disabled={canNotGoNext}
                            aria-label={t("next")}>
                                <NavigateNextIcon /></IconButton></Tooltip>

                            <Tooltip title={t("skip")}>
                               <IconButton
                                size="small"
                                onClick={handleSkip}
                                aria-label={t("skip")}

                                disabled={!isStepOptional(activeStep)}>
                              <SkipNextIcon/>
                               </IconButton></Tooltip></Box>}

                                  {activeStep === steps.length -1 && <Tooltip title={t("finish")}>
                                      <IconButton
                                          size="small"
                                          onClick={() => {}}
                                          aria-label={t("finish")}
                                          type="submit"
                                          disabled={formik.isSubmitting || recaptcha === null || !fieldsToValidatePerStep[activeStep].every(f => (!formik.errors[f]))}>
                                          <DoneIcon/>
                                      </IconButton>

                                  </Tooltip>}
                              </Box>
                          }
                          backButton={
                              <Tooltip title={t("back")}>
                            <IconButton
                                size="small"
                                onClick={handleBack}
                                aria-label={t("back")}
                                disabled={activeStep === 0}>
                              <NavigateBeforeIcon/>
                            </IconButton></Tooltip>

                          }
                        />
</BottomNavigation>

             </form>
          )}
                    </div>



        </Box>




        );

}

export default PreEnrolmentPage;