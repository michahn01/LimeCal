import './css/TimeSelector.css'

import { FC, useState, useEffect, RefObject } from 'react';
import moment from 'moment-timezone';
import axiosConfig from '../axios.ts';



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

// merges adjacent 15-minute intervals and returns merged groups
const getMergedIntervals = (intervals: number[]): string[] => {
    const result: string[] = [];
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

// requirement: 0 <= fraction <= 1
const generateGreenShade = (fraction: number): string => {
    const startColor = { r: 236, g: 236, b: 236 };
    const endColor = { r: 51, g: 153, b: 0 };

    // Interpolate between the start and end colors
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * fraction);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * fraction);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * fraction);

    // Return the RGB color as a string
    return `rgb(${r}, ${g}, ${b})`;
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
    availabilityTable: RefObject<any>;

};
const TimeSelector: FC<TimeSelectorProps> = 
({ viewWindowRange, dates, timezone, addingAvailability, userName, 
    eventPublicId, availabilityTable }) => {

    // console.log("refreshing time selector")
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

    const [panelDates, setPanelDates] = useState<Date[] | string[]>([]);

    const [originalTimezone] = useState<string>(timezone);

    const [numAttendees, setNumAttendees] = useState<number>(0);
    const [lengthColorKey, setLengthColorKey] = useState<number>(0);

    // array of booleans that keeps track of on/off state of every interval
    const [intervalStates, setIntervalStates] = useState<number[]>([]);

    const [userTimesMap, setUserTimesMap] = useState<Map<string, Set<number>>>(new Map<string, Set<number>>());

    // for mobile (touch) compatibility
    const [inTouchMode, setInTouchMode] = useState<boolean>(false);
    const [lastHoveredSlotID, setLastHoveredSlotID] = useState<string>('');

    const loadIntervalStates = (data: Object) => {
        const sortedStates = Object.entries(data).sort((a, b) => {
            return a[0].localeCompare(b[0]);
        });
        const availabilityMap = new Map<string, Set<number>>();
        const loadedStates = Array(intervalStates.length).fill(0);
        let num: number = 0;
        for (let attendee_state of sortedStates) {
            const attendee_name: string = attendee_state[0];
            availabilityMap.set(attendee_name, new Set<number>());
            num += 1;
            const attendee_intervals: string[] = attendee_state[1];
            for (let interval of attendee_intervals) {
                const range: string[] = interval.split("~");
                const end: number = parseInt(range[1]);
                for (let i = parseInt(range[0]); i <= end; ++i) {
                    loadedStates[i] += 1;
                    availabilityMap.get(attendee_name)?.add(i);
                }
            }
        }
        setNumAttendees(num);
        setLengthColorKey(num);
        setIntervalStates(loadedStates);
        setUserTimesMap(availabilityMap);
        availabilityTable.current?.setNumUsers(num);
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

    const fetchIndividualFromApi = () => {
        // console.log(userName);
        axiosConfig.post('/attendee', {
            "event_public_id": eventPublicId,
            "username": userName,
        })
        .then((response) => {
            const attendee_intervals: string[] = response.data.available_times;
            const loadedStates = Array(intervalStates.length).fill(0);
            for (let interval of attendee_intervals) {
                const range: string[] = interval.split("~");
                for (let i = parseInt(range[0]); i <= parseInt(range[1]); ++i) {
                    loadedStates[i] = 1;
                }
            }
            setIntervalStates(loadedStates);
            setNumAttendees(1);
        })
    }

    // callBack for when mouse is lifted (for when selection has been finished being drawn)
    // primary job is to set isDragging to false.
    const DraggingDone = () => {
        if (isDragging && !inTouchMode) {
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

        if (inTouchMode) return;

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
        if (inTouchMode || !addingAvailability) return; 

        const column: number = Math.floor(index / times.length);
        const row: number = index % times.length;
        setIsDragging(true);
        setAddingTimes(!timeSlotActive);
        setStartCellCol(column);
        setStartCellRow(row);
        setHorizontalBound([column, column]);
        setVerticalBound([row, row]);
    }

    // for mobile
    const timeSlotTouched = (index: number, timeSlotActive: number): void => {
        setInTouchMode(true);
        if (!addingAvailability) {
            availabilityTable.current?.setInTouchMode(true);
            const availableUsers = [];
            const unavailableUsers = [];
            for (const [name, userTimes] of userTimesMap.entries()) {
                if (userTimes.has(index)) {
                    availableUsers.push(name);
                }
                else {
                    unavailableUsers.push(name);
                }
            }
            availabilityTable.current?.setAvailableUsers(availableUsers.sort());
            availabilityTable.current?.setUnavailableUsers(unavailableUsers.sort());
        }
        else if (!isDragging) {
            const column: number = Math.floor(index / times.length);
            const row: number = index % times.length;
            setIsDragging(true);
            setAddingTimes(!timeSlotActive);
            setStartCellCol(column);
            setStartCellRow(row);
            setHorizontalBound([column, column]);
            setVerticalBound([row, row]);
        }

    }
    const handleTouchMove = (e: any) => {
        const touchLocation = e.touches[0];
        const elementAtTouchPoint: Element | null = document.elementFromPoint(touchLocation.clientX, touchLocation.clientY);
        const hovered_div_id: string | undefined = elementAtTouchPoint?.id;
        
        if (hovered_div_id && hovered_div_id != lastHoveredSlotID) {
            setLastHoveredSlotID(hovered_div_id);
            const parts: string[] = hovered_div_id.split('&');
            timeSlotHovered(parseInt(parts[1]));
        }
    }
    const touchEnded = () => {
        if (isDragging) {
            setIsDragging(false);
        }
        if (!addingAvailability) {
            availabilityTable.current?.setAvailableUsers([]);
            availabilityTable.current?.setUnavailableUsers([]);
        }
        availabilityTable.current?.setInTouchMode(false);
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
        else if (!addingAvailability) {
            const availableUsers = [];
            const unavailableUsers = [];
            for (const [name, userTimes] of userTimesMap.entries()) {
                if (userTimes.has(index)) {
                    availableUsers.push(name);
                }
                else {
                    unavailableUsers.push(name);
                }
            }
            availabilityTable.current?.setAvailableUsers(availableUsers.sort());
            availabilityTable.current?.setUnavailableUsers(unavailableUsers.sort());
        }
    }

    useEffect(() => {
        if (dates[0].length > 1) {
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
        }
        else {
            dates.sort();
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            setPanelDates(dates.map(num => daysOfWeek[parseInt(num)]));

            const firstInterval: Date = createDate('2024/01/22', viewWindowRange[0], timezone);
            const lastInterval: Date = createDate('2024/01/22', viewWindowRange[1], timezone);
            const result = daysAndMinutesBetween(firstInterval, lastInterval);
            const interval_states: number[] = Array(result.minutes / 15 * dates.length).fill(false);
            setIntervalStates(interval_states);
        }

     }, []);

     useEffect(() => {
        if (intervalStates.length > 0) {
            if (!addingAvailability) {
                fetchTimesFromApi();
            }
            else {
                fetchIndividualFromApi();
            }
        }
        setHorizontalBound([-1, -1]);
        setVerticalBound([-1, -1]);
        setIsDragging(false);
     }, [addingAvailability, times])

    useEffect(() => {
        const newWindowMin: string = convertTimezones(viewWindowRange[0], originalTimezone, timezone);
        const newWindowMax: string = convertTimezones(viewWindowRange[1], originalTimezone, timezone);
        setTimes(getIntervals(newWindowMin, newWindowMax));
    }, [timezone]);

    const smallRectWidth = 300 / numAttendees;

    // Create an array of JSX elements for small rectangles
    const colorLegendKeys: string[] = [];
    for (let i = 0; i <= lengthColorKey; i++) {
      colorLegendKeys.push(
        generateGreenShade(i / lengthColorKey)
      );
    }

    let curr_index: number = 0;
    return (
        <div className='time-selector-group'>
            
            <div className='colors-legend-container'>
                <div className='colors-legend-label left-label'>
                    <sup>0</sup>/<sub>{numAttendees}</sub>​
                </div>
                <div className='colors-legend'>
                {colorLegendKeys.map((shade: string) => {
                    return (
                        <div 
                        key={shade} 
                        style={{
                          width: `${smallRectWidth}px`, 
                          height: '50px', 
                          backgroundColor: `${shade}`
                        }} 
                      />
                    )
                })}
                </div>
                <div className='colors-legend-label right-label'>
                    <sup>{numAttendees}</sup>/<sub>{numAttendees}</sub>
                </div>
            </div>

            

            <div className='time-selector-header-label'>
            {(addingAvailability) ? 
            `Entering ${userName}'s availability:` :
            `Showing everyone's availability:`}    
            </div>


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
            <div className='time-selector-drag-selector-container'>
            {panelDates.map((date, index) => {
                const isRightMost: boolean = index === (dates.length - 1);
                let column_label: any;
                let key: string = "";
                if (typeof date === "string") {
                    column_label = (
                    <div className='date-column-header'>
                        <h2>{date}</h2>
                    </div>
                    );
                    key = date;
                }
                else {
                    const dateDay = parseDayAndDate(date, timezone);
                    column_label = (
                    <div className='date-column-header'>
                        <h2>{dateDay[0]}</h2>
                        <p>{dateDay[1]}</p>
                    </div>
                    );
                    key = date.toISOString();
                }
                return (
                    <div className='date-column' key={key}
                    style={{borderRight: isRightMost ? '1px solid #cfcfcf' : '' }}>
                    {column_label}
                    <div className='date-column-timeslot-container' onMouseLeave={() => {
                                    availabilityTable.current?.setAvailableUsers([]);
                                    availabilityTable.current?.setUnavailableUsers([]);
                    }}>
                        {times.map((time, index) => {
                            const intervalIndex = curr_index;
                            curr_index += 1;
                            return (
                                <div
                                key={time}
                                id={`s&${intervalIndex}`}
                                className={(addingAvailability && !inTouchMode) ? 
                                            'selectable-time-slot time-slot-adding' : 'selectable-time-slot'}
                                style={{
                                    borderBottom: (index + 1) % 4 === 0 ? '1px solid #cfcfcf' : '',
        
                                    // If the timeslot is currently within the user's selection box region, 
                                    // its color depends solely on whether the user is adding times or deleting times.
                                    // If not, the color depends on the fraction of users who are available at that slot. 

                                    backgroundColor: generateGreenShade((isSelected(intervalIndex)) ? 
                                    (addingTimes ? 1 : 0) : (intervalStates[intervalIndex] / numAttendees))
                                }}
                                onMouseDown={() => { 
                                    timeSlotClicked(intervalIndex, intervalStates[intervalIndex]);
                                }}
                                onMouseEnter={() => {timeSlotHovered(intervalIndex)}}
                                onTouchStart={() => {timeSlotTouched(intervalIndex, intervalStates[intervalIndex]);}}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={touchEnded}
                                onTouchCancel={touchEnded}
                                >
                                </div>
                            )
                        })}
                    </div>
                </div>
                )
            })}
            </div>
        </div>
        </div>
    );
};
// ------------------------------
// ------------------------------ End of TimeSelector


export default TimeSelector