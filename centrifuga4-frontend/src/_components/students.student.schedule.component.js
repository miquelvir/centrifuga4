import {useTranslation} from "react-i18next";
import Box from "@material-ui/core/Box";
import React, {useEffect, useState} from "react";
import SchedulesDataService from "../_services/schedules.service";
import {makeStyles} from "@material-ui/core/styles";
import {useErrorHandler} from "../_helpers/handle-response";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';
import styled from "@emotion/styled";
import { useTheme } from '@material-ui/core/styles';
import interactionPlugin from '@fullcalendar/interaction';
import {useSnackbar} from "notistack";
const useStyles = makeStyles((theme) => ({
  fullWidth: {
    width: "100%"
  },
  button: {
    margin: theme.spacing(1),
  },
  sizeSmall: {
    width: "25ch"
  },
    line: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    composite: {
        display: "flex", flexDirection: "row", flex: 1, flexWrap: "wrap",
        gap: theme.spacing(1), width: "100%"
    },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
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
    const theme = useTheme();
   const StyleWrapper = styled.div`
      .fc-button, .fc-button.fc-button-primary {
        background: ${theme.palette.primary.main};
        color: ${theme.palette.primary.contrastText};
        border-color: ${theme.palette.primary.main};
        background-image: none;
    }
    .fc-button:enabled:hover {
        background: ${theme.palette.primary.dark};
        color: ${theme.palette.primary.contrastText};
        border-color: ${theme.palette.primary.dark};
        background-image: none;
    }
    `

    const [schedules, setSchedules] = useState(null);
   const loading = scheduleIds === null;

   const eventFromSchedule = (schedule) => {
       return {
            daysOfWeek: [schedule['day_week']],
            title: schedule['course']['name'],
            groupId: [schedule['id']],
            startTime: schedule['start_time'],
            endTime: schedule['end_time'],
            color: schedule["is_base"]? theme.palette.secondary.main: theme.palette.secondary.light,
            textColor: schedule["is_base"]? theme.palette.secondary.contrastText: theme.palette.secondary.contrastText,
            extendedProps: {
                schedule: schedule
            },
        }
   }

   useEffect(() => {
    if (scheduleIds === null) return;

    if (scheduleIds.length === 0){
      setSchedules([]);
    } else {
      SchedulesDataService
            .getMany(scheduleIds)
            .then(...errorHandler({}))
            .then(function (res) {
                    setSchedules(res.map(res => res["data"]).map(schedule => {
                        return eventFromSchedule(schedule);
                    }));
                });
    }
  }, [scheduleIds, theme]);

   const eventChanged = (info) => {
       const schedule = info.event.extendedProps["schedule"];
       const newEvent = info.event;
       let body = {};
        body['day_week'] = newEvent['start'].getDay();
        body['start_time'] = newEvent['start'].toLocaleTimeString('en-US', { hour12: false });
        body['end_time'] = newEvent['end'].toLocaleTimeString('en-US', { hour12: false });

        if (schedule["is_base"] === true) {
            body['course_id'] = schedule['course_id'];
            body['student_id'] = student_id;
            body['is_base'] = false;
            SchedulesDataService
                    .post(body)
                    .then(...errorHandler({errorOut: true, snackbarSuccess: true}))
                    .then(function (res) {
                        let calendarApi = info.view.calendar;
                        newEvent['is_base'] = true;
                        calendarApi.addEvent(eventFromSchedule(res));
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

    >{// todo fix height
           }
           <Box p={2} style={{height: "100%"}}>
                <StyleWrapper  style={{height: "100%"}}>
                      <FullCalendar
                        plugins={[ timeGridPlugin, interactionPlugin ]}
                        initialView="timeGridWeek"
                        height="100%"
                        firstDay={1}
                        editable={true}
                          selectable={true}
                          selectMirror={true}
                          dayMaxEvents={true}
                          weekends={true}

                            snapDuration={'00:15'}
                        events={schedules}
                        eventAdd={function(){}}
                        eventChange={function(clickInfo){
                            // const schedule = clickInfo.event.extendedProps["schedule"];
                            // if (schedule["is_base"] === true) return enqueueSnackbar(t("cant_remove_schedule"), {'variant': 'warning'});
                        }}
                        eventRemove={function(){}}
                        select={function(selectInfo){
                            let title = prompt('Please enter a new title for your event')
                            let calendarApi = selectInfo.view.calendar

                            calendarApi.unselect() // clear date selection

                            if (title) {
                              calendarApi.addEvent({
                                id: 24,
                                title,
                                start: selectInfo.startStr,
                                end: selectInfo.endStr,
                                allDay: selectInfo.allDay
                              })
                            }
                        }}
                        eventContent={function(){}} // custom render function
                        eventClick={function(clickInfo){
                            const schedule = clickInfo.event.extendedProps["schedule"];
                            if (schedule["is_base"] === true) return enqueueSnackbar(t("cant_remove_schedule"), {'variant': 'warning'});
                           if (window.confirm(t("sure_delete_event"))) {
                               SchedulesDataService
                                    .delete(schedule['id'])
                                    .then(...errorHandler({snackbarSuccess: true}))
                                    .then(function (res) {
                                        clickInfo.event.remove();
                                    });

                        }}}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                        eventResize={eventChanged}
                        eventDrop={eventChanged}
                      />
                </StyleWrapper>
               </Box>
    </div>
  );
}

export default Schedule;