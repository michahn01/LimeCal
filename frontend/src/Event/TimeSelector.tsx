import { FC, useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import { format, utcToZonedTime } from 'date-fns-tz';
import axiosConfig from '../axios.ts';

import './css/TimeSelector.css'


// ------------------------------
// ------------------------------
// ** The overall idea: 

// The "TimeSelector" component refers to the entire panel-structure
// where the user can drag-select times of their choice. 

// The TimeSelector panel is split into multiple columns, each  
// representing its own date. The "DateColumn" component refers 
// to each column representing that date. 

// Each DateColumn component itself contains many contiguous cells
// representing 15-minute intervals. A user can click or drag over
// a cell to "select" it (making it green). Clicking on  
// an already selected cell de-selects all cells dragged over until
// mouse is released.
// ------------------------------
// ------------------------------




// ------------------------------ ** Utility functions:
// ------------------------------

// extracts the date and day from a Date obejct
const parseDayAndDate = (date: Date, timezone: string): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dateInTimeZone = moment.tz(date, timezone);

    const day = days[dateInTimeZone.day()];
    const month = months[dateInTimeZone.month()];
    const datenumber = dateInTimeZone.date();

    return [day, `${month} ${datenumber}`];
}
// converts hh:mm:ss to "X AM" or "Y PM" format
const convertTimestamp = (timestamp: string): string => {
    // console.log(timestamp);
    const hr_min = timestamp.split(':');
    let hours = parseInt(hr_min[0]);
    let min = parseInt(hr_min[1]);

    const amPm = (hours < 12 || hours === 24) ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    if (min == 0) 
    return `${hours} ${amPm}`;

    return `${hours}:${min} ${amPm}`;
}
// given an inclusive start and inclusive end time in hh:mm format, returns an array 
// containing the *start* times of all 15-minute intervals in that range.
const getIntervals = (inclusiveStartTime: string, inclusiveEndTime: string): string[] => {
    const parseTime = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        return time;
    }

    const intervals: string[] = [];
    const startTime: Date = parseTime(inclusiveStartTime);
    const endTime: Date = parseTime(inclusiveEndTime);

    if (endTime > startTime) {
        for (let current = new Date(startTime); current < endTime; current = new Date(current.getTime() + 15 * 60000)) {
            intervals.push(current.toTimeString().substring(0, 5));
        }
        return intervals;
    }

    const midNight: Date = new Date(startTime);
    midNight.setDate(startTime.getDate() + 1);
    midNight.setHours(0, 0, 0, 0);
    for (let current = new Date(startTime); current < midNight; current = new Date(current.getTime() + 15 * 60000)) {
        // console.log("first loop", current.toTimeString().substring(0, 5));
        intervals.push(current.toTimeString().substring(0, 5));
    }
    midNight.setDate(startTime.getDate());
    for (let current = midNight; current < endTime; current = new Date(current.getTime() + 15 * 60000)) {
        // console.log(current.toTimeString().substring(0, 5));
        intervals.push(current.toTimeString().substring(0, 5));
    }
    return intervals;
};

const createDate = (dateString: string, timeString: string, timezone: string): Date => {
    const dateTimeString = `${dateString} ${timeString}`;
    const momentDate = moment.tz(dateTimeString, "YYYY-MM-DD HH-mm", timezone);
    // console.log(momentDate.toDate());
    return momentDate.toDate();
}
function daysAndMinutesBetween(date1: Date, date2: Date) {
    // One day and one minute in milliseconds
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    // Convert both dates to milliseconds
    const date1Ms = date1.getTime();
    const date2Ms = date2.getTime();

    // Calculate the difference in milliseconds
    const differenceMs = Math.abs(date2Ms - date1Ms);

    // Calculate the difference in days and minutes
    const days = Math.floor(differenceMs / oneDay);
    const minutes = Math.floor(differenceMs / oneMinute);

    return { days, minutes };
}

const convertTimezones = (time: string, sourceTimezone: string, targetTimezone: string): string => {
    // Parse the time in the source timezone
    const timeInSourceTimezone = moment.tz(time, "HH:mm", sourceTimezone);
    // Convert the time to the target timezone
    const timeInTargetTimezone = timeInSourceTimezone.tz(targetTimezone);
    // Format the time back to HH:mm format
    return timeInTargetTimezone.format("HH:mm");
}

const convertIndexToDate = (dates: string[], start_time: string, originalTimezone: string, 
                            range_width: number, index: number): string => {
    const quotient = Math.floor(index / range_width);
    const remainder = index % range_width;
    const date: Date = createDate(dates[quotient], start_time, originalTimezone);

    date.setMinutes(date.getMinutes() + 15*remainder);
    return date.toISOString();
}

// merges adjacent 15-minute intervals and returns merged groups
const getMergedIntervals = (intervals: number[]): String[] => {
    const result: String[] = [];
    let curr_start: number = -1; let curr_end: number = -1;
    for (let index = 0; index < intervals.length; ++index) {
        if (intervals[index]) {
            if (curr_start == -1) {
                curr_start = index;
            }
            curr_end = index;
        }
        else {
            if (curr_start == -1) {
                continue;
            }
            result.push(curr_start.toString() + "~" + curr_end.toString());
            curr_start = -1;
        }
    }
    if (curr_start != -1) {
        result.push(curr_start.toString() + "~" + curr_end.toString());
    }
    return result;
}

// ------------------------------
// ------------------------------ ** End of Utility functions



// ------------------------------ ** TimeSelector 
// ------------------------------

type TimeSelectorProps = {
    viewWindowRange: string[];
    dates: string[];
    timezone: string;
    addingAvailability: boolean;
    userName: string;
    eventPublicId: string;
};
// For deciding border styling on column elements (purely cosmetic)
enum ColumnPosition {
    LeftMost, 
    Middle,
    RightMost
}
const TimeSelector: FC<TimeSelectorProps> = ({ viewWindowRange, dates, timezone, addingAvailability, userName, eventPublicId }) => {

    // 'times' contains the start times of all 15-minute time slots that must be 
    // displayed in selection panel's viewing window.  
    const [times, setTimes] = useState<string[]>([]);

    // indicates whether user is dragging (i.e., a selection/de-selection is being made).
    // When user isDragging, they'll be drawing a rectangular box over the panel region.
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // whether the user is selecting or deselecting time slots (if the user 
    // had clicked on an already-selected time slot, they are de-selecting)
    const [addingTimes, setAddingTimes] = useState<boolean>(false);

    // the column of the specific cell that the user clicked on to begin dragging a selection region.
    const [startCellCol, setStartCellCol] = useState<number>(0);
    // the row of the specific cell that the user clicked on to begin dragging a selection region.
    const [startCellRow, setStartCellRow] = useState<number>(0);

    // horizontal and vertical bounds of the user's selection region. Constantly 
    // changes as the user drags over time slots.
    const [horizontalBound, setHorizontalBound] = useState<number[]>([0, 0]);
    const [verticalBound, setVerticalBound] = useState<number[]>([0, 0]);

    const [panelDates, setPanelDates] = useState<Date[]>([]);

    const [originalTimezone] = useState<string>(timezone);

    // array of booleans that keeps track of on/off state of every interval
    const [intervalStates, setIntervalStates] = useState<number[]>([]);


    const clearIntervalStates = () => {
        if (intervalStates.length > 0) {
            setIntervalStates(Array(intervalStates.length).fill(0));
        }
    }

    const loadIntervalStates = (data: Object) => {
        console.log("lOADING")
        const sortedStates = Object.entries(data).sort((a, b) => {
            return a[0].localeCompare(b[0]);
        });
        const loadedStates = Array(intervalStates.length).fill(0);
        for (let attendee_state of sortedStates) {
            const attendee_name: string = attendee_state[0];
            const attendee_intervals: string[] = attendee_state[1];
            for (let interval of attendee_intervals) {
                const range: string[] = interval.split("~");
                for (let i = parseInt(range[0]); i <= parseInt(range[1]); ++i) {
                    loadedStates[i] += 1;
                }
            }
        }
        setIntervalStates(loadedStates);
    }

    const sendTimeUpdatesToApi = () => {
        const mergedIntervals: String[] = getMergedIntervals(intervalStates);
        if (!(userName && eventPublicId)) return;
        axiosConfig.put('/attendee', {
            "event_public_id": eventPublicId,
            "username": userName,
            "available_times": mergedIntervals
        })
        .catch((response) => {
            console.log(eventPublicId, userName);
            console.log(response);
        })
    }

    const fetchTimesFromApi = () => {
        axiosConfig.get(`/event/${eventPublicId}`)
        .then((response) => {
            loadIntervalStates(response.data.attendees);
        })
    }

    // callBack for when mouse is lifted (for when selection has been finished being drawn)
    // primary job is to set isDragging to false.
    const DraggingDone = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };
    useEffect(() => {
        if (!isDragging && intervalStates.length > 0) {
            const newIntervalStates: number[] = intervalStates;
            for (let i: number = horizontalBound[0]; i <= horizontalBound[1]; ++i) {
                for (let j: number = verticalBound[0]; j <= verticalBound[1]; ++j) {
                    const index: number = i * times.length + j;
                    if (isSelected(index)) {
                        newIntervalStates[index] = addingTimes ? 1 : 0;
                    }
                }
            }
            sendTimeUpdatesToApi();
            return;
        }
        document.addEventListener('mouseup', DraggingDone);
        return () => {
            document.removeEventListener('mouseup', DraggingDone);
        };
    }, [isDragging]);

    // function for determining whether a particular time slot is part of the selection box
    // being dragged/drawn by the user.
    const isSelected = (index: number): boolean => {
        const column: number = Math.floor(index / times.length);
        const row: number = index % times.length;
        return (horizontalBound[0] <= column && column <= horizontalBound[1] &&
                verticalBound[0] <= row && row <= verticalBound[1]);
    }   

    // callback function for when user clicks on a particular time slot to being drawing a selection.
    // Function will be called from within a DateColumn component. 
    const timeSlotClicked = (index: number, timeSlotActive: number): void => {
        if (!addingAvailability) return; 

        const column: number = Math.floor(index / times.length);
        const row: number = index % times.length;
        setIsDragging(true);
        setAddingTimes(!timeSlotActive);
        setStartCellCol(column);
        setStartCellRow(row);
        setHorizontalBound([column, column]);
        setVerticalBound([row, row]);
    }

    // callback function for when user hovers over a particular time slot.
    // Function will be called from within a DateColumn component.
    const timeSlotHovered = (index: number): void => {
        if (isDragging) {
            const column: number = Math.floor(index / times.length);
            const row: number = index % times.length;
            let min_horizontal_bound: number = column < startCellCol ? column : startCellCol;
            let max_horizontal_bound: number = column > startCellCol ? column : startCellCol;
            let min_vertical_bound: number = row < startCellRow ? row : startCellRow;
            let max_vertical_bound: number = row > startCellRow ? row : startCellRow;

            setVerticalBound([min_vertical_bound, max_vertical_bound]);
            setHorizontalBound([min_horizontal_bound, max_horizontal_bound]);
        }
    }

    useEffect(() => {
        const firstInterval: Date = createDate(dates[0], viewWindowRange[0], timezone);
        const lastInterval: Date = createDate(dates[0], viewWindowRange[1], timezone);
        const result = daysAndMinutesBetween(firstInterval, lastInterval);
        const interval_states: number[] = Array(result.minutes / 15 * dates.length).fill(false);
        setIntervalStates(interval_states);

        let arr: Date[] = [];
        for (let date of dates) {
            arr.push(createDate(date, viewWindowRange[0], timezone))
        }
        setPanelDates(arr);

     }, []);

     useEffect(() => {
        if (!addingAvailability && intervalStates.length > 0) {
            fetchTimesFromApi();
        }
     }, [addingAvailability, times])

    useEffect(() => {
        const newWindowMin: string = convertTimezones(viewWindowRange[0], originalTimezone, timezone);
        const newWindowMax: string = convertTimezones(viewWindowRange[1], originalTimezone, timezone);
        setTimes(getIntervals(newWindowMin, newWindowMax));
    }, [timezone]);

    let curr_index: number = 0;
    return (
        <div className='time-selector'>
            <div className='times-labels-container'>
            <div className='header'></div>
            {times.map((time, index) => {
                if (index % 4 !== 0) {
                    return;
                }
                return (
                    <div key={time} className='time-label'>
                        {convertTimestamp(time)}
                    </div>
                )
            })}
            <div className='time-label'>
                {convertTimestamp(convertTimezones(viewWindowRange[1], originalTimezone, timezone))}
            </div>
            </div>
            {panelDates.map((date, index) => {
                const col_pos = index === 0 ? ColumnPosition.LeftMost : 
                (index === dates.length ? ColumnPosition.RightMost : ColumnPosition.Middle);
                const dateDay = parseDayAndDate(date, timezone);
                return (
                    <div className='date-column' key={date.toISOString()}>
                    <div className='date-column-header'
                         style={{borderLeft: col_pos === ColumnPosition.LeftMost ? '1px solid #cfcfcf' : '' }}>
                        <h2>{dateDay[0]}</h2>
                        <p>{dateDay[1]}</p>
                    </div>
                    <div className='date-column-timeslot-container'
                         style={{borderRight: col_pos !== ColumnPosition.RightMost ? '1px solid whitesmoke' : '' }}>
                        {times.map((time, index) => {
                            const intervalIndex = curr_index;
                            curr_index += 1;
                            return (
                                <div 
                                key={time}
                                className={addingAvailability ? 'selectable-time-slot time-slot-adding' : 'selectable-time-slot'}
                                style={{
                                    borderBottom: (index + 1) % 4 === 0 ? '1px solid whitesmoke' : '',
        
                                    // If the timeslot is currently within the user's selection box region, 
                                    // its color depends solely on whether the user is adding times or deleting times.
                                    // If not, the color depends on whether it was a previously selected time slot. 
                                    backgroundColor: ((isSelected(intervalIndex)) ? addingTimes : 
                                    intervalStates[intervalIndex])  ? '#68b516' : '#cfcfcf',
                                }}
                                onMouseDown={() => { 
                                    timeSlotClicked(intervalIndex, intervalStates[intervalIndex]);
                                }}
                                onMouseEnter={() => {timeSlotHovered(intervalIndex)}}>
                                </div>
                            )
                        })}
                    </div>
                </div>
                )
            })}
        </div>
    );
};
// ------------------------------
// ------------------------------ End of TimeSelector


export default TimeSelector