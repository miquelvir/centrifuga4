import Box from "@material-ui/core/Box";
import React, {useEffect, useState} from "react";
import SchedulesDataService from "../_services/schedules.service";
import {makeStyles} from "@material-ui/core/styles";
import {useErrorHandler} from "../_helpers/handle-response";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';
import styled from "@emotion/styled";
import {useTheme} from '@material-ui/core/styles';
import interactionPlugin from '@fullcalendar/interaction';
import Skeleton from "@material-ui/lab/Skeleton";
import {Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core";
import DialogContentText from "@material-ui/core/DialogContentText";
import Button from "@material-ui/core/Button";
import {useTranslation} from "react-i18next";
import {confirmContext} from "../_context/confirm-context";
import {tabContext} from "../_context/tab-context";


export const eventFromSchedule = (theme, schedule) => {
    return {
        daysOfWeek: [schedule['day_week']],
        title: schedule['display_name'],
        groupId: [schedule['id']],
        id: schedule['id'],
        startTime: schedule['start_time'],
        endTime: schedule['end_time'],
        color: schedule["is_base"] ? theme.palette.secondary.main : theme.palette.secondary.light,
        textColor: schedule["is_base"] ? theme.palette.secondary.contrastText : theme.palette.secondary.contrastText,
        extendedProps: {
            schedule: schedule
        },
    }
}

function evaluate(expression, ...args){
    console.log(typeof expression);
    if (typeof expression === 'function'){
        return expression(...args);
    }

    return expression;
}

function Scheduler({snapDuration = '00:15',
                       allowView=false, viewUrl=null,
                        allowDelete=false,
                    selectable=false,
                       viewStudent=false, deleteCustom=false,
                      scheduleIds,
                    setScheduleIds,
                       onEventClick, onEventSelected,
                       onEventChange, editable=false, ...other}) {
    const errorHandler = useErrorHandler();
    const theme = useTheme();
    const calendarRef = React.createRef();
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
    const {t} = useTranslation();
    // todo right click menu to delete


    useEffect(() => {
        if (scheduleIds === null) return;

        if (scheduleIds.length === 0) {
            setSchedules([]);
        } else {
            SchedulesDataService
                .getMany(scheduleIds)
                .then(...errorHandler({}))
                .then(function (res) {
                    setSchedules(res.map(res => res["data"]).map(schedule => {
                        return eventFromSchedule(theme, schedule);
                    }));
                });
        }
    }, [scheduleIds, theme]);

    const withScheduleInfo = (method, info) => {
        return method(info,
            info.event['start'].getDay(),
            info.event['start'].toLocaleTimeString('en-US', {hour12: false}),
            info.event['end'].toLocaleTimeString('en-US', {hour12: false}),
            info.event.extendedProps["schedule"]);
    }
    const navigator = React.useContext(tabContext);

    const [currentSchedule, setCurrentSchedule] = React.useState({open: false, event: null, schedule: null})

      const handleClickOpen = (info) => {
        setCurrentSchedule({open: true, event: info.event, schedule: info.event.extendedProps['schedule']});
      };

      const handleClose = () => {
        setCurrentSchedule({open: false, event: null, schedule: null});
      };
      const handleView = () => {
          navigator.goTo(...evaluate(viewUrl, currentSchedule.schedule));
          handleClose();
      }
      const handleDelete = () => {
          SchedulesDataService
               .delete(currentSchedule.schedule.id)
               .then(...errorHandler({snackbarSuccess: true}))
               .then(function (res) {
                  handleClose();
                    setScheduleIds(scheduleIds.filter(id => id !== currentSchedule.schedule.id));
                    setSchedules(schedules.filter(s => s.id !== currentSchedule.schedule.id));
               });
      }

    return (
        <Box p={2} style={{height: '100%', flex: 1, minHeight: "70vh" }}>
            {loading ? <Skeleton variant="rect" width="100%" height="100%"/>
                :
                <React.Fragment>
                    <Dialog open={currentSchedule.open} onClose={handleClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">{currentSchedule.schedule? currentSchedule.schedule["display_name"]: ""}</DialogTitle>
                        <DialogActions>
                          <Button onClick={handleClose} color="primary">
                              {t("cancel")}
                          </Button>

                             <Button
                                 disabled={!(currentSchedule.schedule !== null &&
                                            evaluate(allowView, currentSchedule.schedule))}
                                 onClick={handleView}
                                 color="primary">
                                {t("view")}
                            </Button>

                            <Button
                                    disabled={!(currentSchedule.schedule !== null &&
                                            evaluate(allowDelete, currentSchedule.schedule))}
                                    onClick={handleDelete}
                                    color="secondary">
                                    {t("delete")}
                            </Button>
                        </DialogActions>
                      </Dialog>
                    <StyleWrapper style={{height: "100%"}}>
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        height="100%"
                        firstDay={1}
                        ref={calendarRef}
                        editable={editable}
                        buttonText={{
                            prev:     '<', // <
                              next:     '>', // >
                              prevYear: '<<',  // <<
                              nextYear: '>>',  // >>
                              today:    'today',
                              month:    'month',
                              week:     'week',
                              day:      'day'
                        }}
                        selectable={selectable}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        snapDuration={snapDuration}
                        events={schedules}
                        eventAdd={function () {
                        }}
                        eventChange={function (clickInfo) {
                            // const schedule = clickInfo.event.extendedProps["schedule"];
                            // if (schedule["is_base"] === true) return enqueueSnackbar(t("cant_remove_schedule"), {'variant': 'warning'});
                        }}
                        eventRemove={function () {
                        }}
                        select={function (selectInfo) {
                            selectInfo.view.calendar.unselect();
                            onEventSelected( selectInfo.start.getDay(),
            selectInfo.start.toLocaleTimeString('en-US', {hour12: false}),
            selectInfo.end.toLocaleTimeString('en-US', {hour12: false}),)
                        }}
                        eventContent={function () {
                        }} // custom render function
                        eventClick={(info) => {
                            /* let calendarApi = calendarRef.current.getApi();
                              console.log(calendarApi.getEventById(info.event.id).remove());
                              setSchedules(schedules.filter(s=>s.id !== info.event.id));*/
                            handleClickOpen(info);
                        }}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                        eventResize={(info) => (withScheduleInfo(onEventChange, info))}
                        eventDrop={(info) => (withScheduleInfo(onEventChange, info))}
                    />
                </StyleWrapper>
                </React.Fragment>
                }
        </Box>
    );
}

export default Scheduler;