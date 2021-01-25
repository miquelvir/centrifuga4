import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import {useTranslation} from "react-i18next";
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import useTheme from "@material-ui/core/styles/useTheme";
import RoomsDataService from "../_services/rooms.service";
import {useErrorHandler} from "../_helpers/handle-response";
import RoomSchedule from "./rooms.room.schedule.component";
import RoomDetails from "./rooms.room.details.component";
import {useNeeds} from "../_helpers/needs";

const useStyles = makeStyles((theme) => ({
  contentPanel: {
    //flex: 1,
      position: 'relative', // todo proper scrollbar
    overflow: "auto",
    boxSizing: "border-box",
      height: '100%', // todo proper,
    display: 'flex',
      flexDirection: 'column'
  },
    content: {
      overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        flex: 1,
        height: '100%'
    },
    tab: {
      height: '100%'
    }
}));


function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


export default function Room({history, setNewRoom, currentRoomId, deleteRoom, newRoom, addRoomId}) {
  const loading = currentRoomId === null;

  const errorHandler = useErrorHandler();

  const [room, setRoom] = useState(null);

  useEffect(() => {
    if (loading) return setRoom(null);
    RoomsDataService
            .getOne(currentRoomId)
            .then(...errorHandler({}))  // todo everywhere
            .then(function (res) {
                    setRoom(res["data"]);
                });
  }, [currentRoomId])

  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

   useEffect(()=>{
    setValue(0);
  }, [currentRoomId])

  const handleChangeIndex = (index) => {
    setValue(index);
  };const [hasNeeds, NEEDS] = useNeeds();

  return (
    <Paper elevation={3} square className={classes.contentPanel}>
            <AppBar position="static" color="default">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="on"
                >
                  <Tab label={t("room")} {...a11yProps(0)} />

                    { !newRoom && hasNeeds([NEEDS.schedules]) &&
                  <Tab label={t("schedules")} {...a11yProps(1)} />}

                </Tabs>
              </AppBar>
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={value}
            containerStyle={{height: '100%'}}
            className={classes.content}
            onChangeIndex={handleChangeIndex}
          >
                   <RoomDetails value={value}
                      index={0}
                                newRoom={newRoom}
                                setNewRoom={setNewRoom}
                      dir={theme.direction}
                      currentStudent={room}
                      updateCurrentStudent={setRoom}
                      deleteStudent={deleteRoom}
            />


              {hasNeeds([NEEDS.schedules]) && <RoomSchedule value={value}
                             index={1}
                             history={history}
                             className={classes.tab}
                             dir={theme.direction}
                             scheduleIds={room === null ? null : room['schedules']}
                             student_id={currentRoomId}
              />}

          </SwipeableViews>

    </Paper>
  );
}
