import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Tooltip} from "@material-ui/core";
import TeachersDataService from "../_services/teachers.service";
import ItemsList from "./items_list.component";
import Teacher from "./teachers.teacher.component";
import {useNeeds} from "../_helpers/needs";
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


export default function Teachers({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState(null);
const [hasNeeds, NEEDS] = useNeeds();
  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentTeacherId(id);
  }, [id])

  useEffect(() => {
      if (currentTeacherId !== null) setNewTeacher(false);
  }, [currentTeacherId])

  return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("teachers")}</h1>
            <ItemsListMain
                setCurrentItemId={setCurrentTeacherId}
                currentItemId={currentTeacherId}
                items={teachers}
                setItems={setTeachers}
                defaultSearchBy="full_name"
                searchByOptions={["full_name", "id"]}
                dataService={TeachersDataService}
                searchBarLabel="teachers"
            />

            {hasNeeds([NEEDS.post]) && <Tooltip title={t("new_teacher")}>
                <Fab className={classes.fab} color="primary" onClick={(e) => {
                    setCurrentTeacherId(null);
                    setNewTeacher(true);
                }}>
                    <AddIcon/>
                </Fab>
            </Tooltip>}
        </Grid>

        <Grid item xs={8} className={classes.left}>
          <Teacher
            currentTeacherId={currentTeacherId}
            newTeacher={newTeacher}
            setNewTeacher={setNewTeacher}
            history={history}
            addTeacherId={(id) =>{
                setCurrentTeacherId(id);
            }}
            deleteTeacher={(studentId) => {
                if (studentId === currentTeacherId) setCurrentTeacherId(null);

                setTeachers(teachers.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
