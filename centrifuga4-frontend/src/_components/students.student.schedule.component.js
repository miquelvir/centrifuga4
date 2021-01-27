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


function Schedule({ value, index, title, scheduleIds, student_id, ...other }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();
  const errorHandler = useErrorHandler();
  const confirm = React.useContext(confirmContext);
const theme = useTheme();
   const eventChanged = (info, day_week, start_time, end_time, schedule) => {
       const newEvent = info.event;
       let body = {};
        body['day_week'] = day_week;
        body['start_time'] = start_time;
        body['end_time'] = end_time;

        if (schedule["is_base"]) {
            body['course_id'] = schedule["course_id"];
            body['student_id'] = student_id;
            SchedulesDataService
                    .post(body)
                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                    .then(function (res) {
                        let calendarApi = info.view.calendar;
                        newEvent['is_base'] = false;  // todo why needed
                        calendarApi.addEvent(eventFromSchedule(theme, res));
                        info.revert();
                    }).catch(function(err){
                        info.revert();
            });

        } else {
            SchedulesDataService
                    .patch({id: schedule['id'],
                                                body: body,
                                                initial_values: schedule})
                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                    .then(function (res) {
                        /*setSchedules(schedules.map(payment => {
                          if (payment.id !== res['id']) return payment;
                          return res;
                        }))*/
                    }).catch(function (err){
                        info.revert();
                    });
        }
    }
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
            onEventClick={function (clickInfo) {
                           const schedule = clickInfo.event.extendedProps["schedule"];
                           if (schedule["is_base"] === true) return enqueueSnackbar(t("cant_remove_schedule"), {'variant': 'warning'});
                           confirm.confirm("sure_delete_event", null,
                               (clickInfo) => {
                               SchedulesDataService
                                   .delete(schedule['id'])
                                   .then(...errorHandler({snackbarSuccess: true}))
                                   .then(function (res) {
                                       clickInfo.event.remove();  // todo no longer working
                                   });
                               }, null)
                       }}
            onEventDrop={eventChanged}
            onEventResize={eventChanged}
            scheduleIds={scheduleIds}
            editable={true}
        />
    </div>
  );
}

export default Schedule;