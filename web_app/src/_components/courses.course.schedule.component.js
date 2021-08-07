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


function CourseSchedule({ title, scheduleIds, setScheduleIds, student_id, ...other }) {
  const errorHandler = useErrorHandler();

  return (
    <div
      {...other}
        style={{height: '100%', flex: 1, minHeight: "70vh" }}

    >
        <Scheduler
            allowDelete={(s) => true}
            allowView={(s) => !s.is_base}
            viewUrl={(s) => ['/students', s.student_id]}
            setScheduleIds={setScheduleIds}
            onEventChange={(info, day_week, start_time, end_time, schedule) => {
                SchedulesDataService
                    .patch({id: schedule['id'],
                                                body: {day_week: day_week, start_time: start_time, end_time: end_time},
                                                initial_values: schedule})
                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                    .then(function (res) {})
                    .catch(function (err){ info.revert(); });
            }}
            viewStudent={true}
            scheduleIds={scheduleIds}
            editable={true}
            selectable={true}
            onEventSelected={(day_week, start_time, end_time) => {
                    SchedulesDataService
                        .post({day_week: day_week, start_time: start_time, end_time: end_time, course_id: student_id})
                        .then(res => {
                            setScheduleIds([...scheduleIds, res['id']])
                        })
            }}
        />
    </div>
  );
}

export default CourseSchedule;