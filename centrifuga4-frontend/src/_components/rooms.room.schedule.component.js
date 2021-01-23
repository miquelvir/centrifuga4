import {useTranslation} from "react-i18next";
import React from "react";
import SchedulesDataService from "../_services/schedules.service";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {useErrorHandler} from "../_helpers/handle-response";
import {useSnackbar} from "notistack";
import Scheduler, {eventFromSchedule} from "./scheduler.component";
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
    calendar: {
      margin: theme.spacing(2)
    }

}));


function RoomSchedule({ value, history, index, scheduleIds, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();

  // todo no minHeight ? and also tabpanel component
  return (
    <div
      role="tabpanel"
      className={classes.root}
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
        style={{height: '100%', flex: 1, minHeight: "70vh" }}

    >
        <Scheduler
            onEventClick={function (clickInfo) {  // todo receive schedule
                           const schedule = clickInfo.event.extendedProps["schedule"];
                           if (schedule["is_base"]){
                               history.push('/courses?id='+schedule['course_id']);
                           } else {
                               history.push('/?id='+schedule['student_id']);
                           }
                       }}
            scheduleIds={scheduleIds}
            editable={false}
        />
    </div>
  );
}

export default RoomSchedule;