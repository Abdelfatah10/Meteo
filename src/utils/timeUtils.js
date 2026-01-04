/**
 * Get local time and date information based on timezone offset
 */
export const getLocalNow = (timezone) => {
    const timezoneOffset = parseInt(timezone);

    if (isNaN(timezoneOffset)) {
        throw new Error('Invalid timezone offset');
    }

    const nowUTC = new Date();
    const local = new Date(nowUTC.getTime() + timezoneOffset * 1000);

    const formatterTime = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    });

    const formatterDate = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
    });

    const formatterWeekday = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        timeZone: 'UTC'
    });

    return {
        time: formatterTime.format(local),
        date: formatterDate.format(local),
        weekday: formatterWeekday.format(local),
        hour: local.getUTCHours()
    };
};
