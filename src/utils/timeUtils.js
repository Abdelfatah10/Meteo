import AppError from "./AppError.js";


/**
 * Get local time and date information based on timezone offset
 */
export const getLocalNow = (timezone) => {
    const timezoneOffset = Number(timezone);

    if (Number.isNaN(timezoneOffset)) {
        throw new AppError('Weather service is temporarily unavailable', 502);
    }

    const nowUTC = new Date();
    const local = new Date(nowUTC.getTime() + timezoneOffset * 1000)
    const baseOptions = { timeZone: 'UTC' };

    const formatterTime = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        ...baseOptions
    });

    const formatterDate = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...baseOptions
    });

    const formatterWeekday = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        ...baseOptions
    });

    return {
        time: formatterTime.format(local),
        date: formatterDate.format(local),
        weekday: formatterWeekday.format(local),
        hour: local.getUTCHours()
    };
};
