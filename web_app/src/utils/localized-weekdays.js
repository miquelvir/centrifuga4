export const getNextDayOfWeek = (date, dayOfWeek) => {
    // Code to check that date and dayOfWeek are valid left as an exercise ;)

    var resultDate = new Date(date.getTime());

    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);

    return resultDate;
}

export const getLocalisedWeekday = (dayOfWeek) => {
    let today = new Date();
    let nextDayOfWeek = getNextDayOfWeek(today, dayOfWeek);
    return nextDayOfWeek.toLocaleString(window.navigator.language, {weekday: 'short'});
}

export const textSchedulesForCourse = (course) => {
    if (!course["base_schedules"]) return null;
    return course["base_schedules"].map(s => getLocalisedWeekday(s.day_week) + ", " + s.start_time.slice(0, -3) + " - " + s.end_time.slice(0, -3)).join("; ");
}

