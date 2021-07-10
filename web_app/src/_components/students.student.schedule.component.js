import {useTranslation} from "react-i18next";
import React from "react";
import SchedulesDataService from "../_services/schedules.service";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useErrorHandler} from "../_helpers/handle-response";
import {useSnackbar} from "notistack";
import Scheduler, {eventFromSchedule} from "./scheduler.component";
import {confirmContext} from "../_context/confirm-context";
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
    calendar: {
      margin: theme.spacing(2)
    }

}));


function Schedule({ title, scheduleIds, setScheduleIds, student_id, ...other }) {
  const classes = useStyles();
  const errorHandler = useErrorHandler();
  const theme = useTheme();

  return (
    <div style={{height: '100%', flex: 1, minHeight: "70vh" }}>

    </div>
  );
}

export default Schedule;