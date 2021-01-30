import {useTranslation} from "react-i18next";
import React from "react";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import Scheduler, {eventFromSchedule} from "./scheduler.component";
const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
    calendar: {
      margin: theme.spacing(2)
    }

}));


function TeacherSchedule({  setSchedulesIds, scheduleIds, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div
      {...other}
        style={{height: '100%', flex: 1, minHeight: "70vh" }}

    >
        <Scheduler
            scheduleIds={scheduleIds}
            editable={false}
            allowView={true}
            viewUrl={(s) => ['/courses', s.course_id]}
        />
    </div>
  );
}

export default TeacherSchedule;