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

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1),
    },
    calendar: {
        margin: theme.spacing(2)
    }

}));

export const eventFromSchedule = (theme, schedule) => {
    return {
        daysOfWeek: [schedule['day_week']],
        title: schedule['course']['name'],
        groupId: [schedule['id']],
        startTime: schedule['start_time'],
        endTime: schedule['end_time'],
        color: schedule["is_base"] ? theme.palette.secondary.main : theme.palette.secondary.light,
        textColor: schedule["is_base"] ? theme.palette.secondary.contrastText : theme.palette.secondary.contrastText,
        extendedProps: {
            schedule: schedule
        },
    }
}

function Scheduler({snapDuration = '00:15', scheduleIds, onEventClick, onEventResize, onEventDrop, editable=false, ...other}) {
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

    return (
        <Box p={2} style={{height: "100%"}}>
            {loading ? <Skeleton variant="rect" width="100%" height="100%"/>
                :
                <StyleWrapper style={{height: "100%"}}>
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        height="100%"
                        firstDay={1}
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
                        selectable={true}
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
                            // todo proper prompts
                            /*let title = prompt('Please enter a new title for your event')
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
                            }*/
                        }}
                        eventContent={function () {
                        }} // custom render function
                        eventClick={onEventClick}
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        }}
                        eventResize={(info) => (withScheduleInfo(onEventResize, info))}
                        eventDrop={(info) => (withScheduleInfo(onEventDrop, info))}
                    />
                </StyleWrapper>}
        </Box>
    );
}

export default Scheduler;