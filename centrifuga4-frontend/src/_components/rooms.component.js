import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {useTranslation} from "react-i18next";
import Student from "./students.student.component";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import {Tooltip} from "@material-ui/core";
import ItemsList from "./items_list.component";
import RoomsDataService from "../_services/rooms.service";
import Room from "./rooms.room.component";
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


export default function Rooms({history, ...other}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);

  const query = new URLSearchParams(window.location.search);
  const id = query.get('id');
  useEffect(() => {
      if (id !== null && id !== undefined) setCurrentRoomId(id);
  }, [id])

  useEffect(() => {
      if (currentRoomId !== null) setNewRoom(false);
  }, [currentRoomId])
const [hasNeeds, NEEDS] = useNeeds();
  return (
      <Grid container spacing={3} className={classes.root}>
        <Grid item xs={4} className={classes.left}>
          <h1>{t("rooms")}</h1>
          <ItemsListMain
            setCurrentItemId={setCurrentRoomId}
            currentItemId={currentRoomId}
            items={rooms}
            setItems={setRooms}
            defaultSearchBy="name"
            displayNameField="name"
            searchByOptions={["name", "id"]}
            dataService={RoomsDataService}
            searchBarLabel="rooms"
          />
            {hasNeeds([NEEDS.post]) && <Tooltip title={t("new_room")}>
                <Fab className={classes.fab} color="primary" onClick={(e) => {
                    setCurrentRoomId(null);
                    setNewRoom(true);
                }}>
                    <AddIcon/>
                </Fab>
            </Tooltip>}
        </Grid>

        <Grid item xs={8} className={classes.left}>
          <Room
            currentRoomId={currentRoomId}
            newRoom={newRoom}
            setNewRoom={setNewRoom}
            history={history}
            addRoomId={(id) =>{
                setCurrentRoomId(id);
            }}
            deleteRoom={(studentId) => {
                if (studentId === currentRoomId) setCurrentRoomId(null);

                setRooms(rooms.filter((s) => s['id'] !== studentId));
            }}
          />
        </Grid>
      </Grid>
  );
}
