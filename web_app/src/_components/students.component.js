import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Student from "./students.student.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Chip, Tooltip} from "@material-ui/core";
import StudentsDataService from "../_services/students.service";
import ItemsList from "./items_list.component";
import ExportSearchChip from "./ExportSearchChip.component";
import Avatar from "@material-ui/core/Avatar";
import {downloadGodFile} from "../_services/god.service";
import {useErrorHandler} from "../_helpers/handle-response";
import {useNeeds} from "../_helpers/needs";
import {loadingContext} from "../_context/loading-context";
import ItemsListMain from "./items_list_main.component";

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
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


export default function Students({...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
    const handleError = useErrorHandler();
  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  const [hasNeeds, NEEDS] = useNeeds();
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentStudentId(id);
  }, [id]);
  const loadingCtx = React.useContext(loadingContext);


  useEffect(() => {
      if (currentStudentId !== null) setNewStudent(false);
  }, [currentStudentId])

  return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("students")}</h1>
            <ItemsListMain
                setCurrentItemId={setCurrentStudentId}
                currentItemId={currentStudentId}
                items={students}
                setItems={setStudents}
                chips={[
                    <Tooltip title={t("export_contact_sheets")}
                           aria-label={t("export_contact_sheets")}>
                    <Chip variant="outlined"
                          color="primary"
                          disabled={loadingCtx.loading}
                          size="small"
                          avatar={<Avatar>csv</Avatar>}
                          label={t("export_all_plus")}
                          onClick={() => {
                              if (loadingCtx.loading) return;
                              loadingCtx.startLoading();
                            downloadGodFile()
                                .then(...handleError({}))
                                .finally(() => {
                                    loadingCtx.stopLoading();
                                })
                          }}/>
                  </Tooltip>
                ]}
                usableFilters={[{
                    name: 'enrolment_status',
                    defaultValue: null,
                    options: [
                        {
                            label: "enrolled",
                            tooltip: "only_enrolled",
                            name: 'enrolled'
                        }, {
                            label: "pre-enrolled",
                            tooltip: "only_preenrolled",
                            name: 'pre-enrolled'
                        }, {
                            label: "early-unenrolled",
                            tooltip: "only_earlyunenrolled",
                            name: 'early-unenrolled'
                        }
                    ]
                },
                    {
                      name: 'default_payment_method',
                        defaultValue: null,
                        options: [
                           {label: "cash", tooltip: "only_cash", name: 'cash'},
                                {label: "bank-transfer", tooltip: "only_banktransfer", name: 'bank-transfer'},
                                {
                                    label: "bank-direct-debit",
                                    tooltip: "only_bankdirectdebit",
                                    name: 'bank-direct-debit'
                                }
                        ]
                    }]}
                defaultSearchBy="full_name"
                searchByOptions={["full_name", "id"]}
                dataService={StudentsDataService}
                searchBarLabel="students"
            />

            {hasNeeds([NEEDS.post]) && <Tooltip title={t("new_student")}>
                <Fab className={classes.fab} color="primary" onClick={(e) => {
                    setCurrentStudentId(null);
                    setNewStudent(true);
                }}>
                    <AddIcon/>
                </Fab>
            </Tooltip>}
        </Grid>

        <Grid item xs={8} className={classes.left}>
          <Student
            currentStudentId={currentStudentId}
            newStudent={newStudent}
            setNewStudent={setNewStudent}
            addStudentId={(id) =>{
                setCurrentStudentId(id);
            }}
            deleteStudent={(studentId) => {
                if (studentId === currentStudentId) setCurrentStudentId(null);

                setStudents(students.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
