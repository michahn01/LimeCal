import React, { useState, useEffect } from 'react';
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

// just a utility function for extracting the date and day from a Date obejct
const parseDayAndDate = (date: Date): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNumber = date.getDate();

    return [day, `${month} ${dateNumber}`];
}
// utility function for converting hh:mm:ss to "X AM" or "Y PM" format
const convertTimestamp = (timestamp: string): string => {
    const hoursString = timestamp.split(':')[0];
    let hours = parseInt(hoursString);

    const amPm = hours < 12 ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${hours} ${amPm}`;
}
// a utility function for development and testing (generates a fixed interval of time slots)
const getIntervals = (): string[] => {
    const intervals = [];
    const currentDate = new Date();
    
    const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endTime = new Date(startTime.getTime());
    endTime.setHours(endTime.getHours() + 12); 

    for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 15)) {
        intervals.push(time.toISOString().split('T')[1].split('.')[0]);
    }

    return intervals;
};
// a utility function for development and testing (generates a fixed interval of dates)
const generateDates = (): Date[] => {
    let dates: Date[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < 10; i++) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}
// ------------------------------
// ------------------------------ ** End of Utility functions




// ------------------------------ ** DateColumn component
// ------------------------------

// These enums are for deciding border styling on column elements (purely cosmetic purposes)
enum ColumnPosition {
    LeftMost, 
    Middle,
    RightMost
}
type DateColumnProps = {

    col_pos: ColumnPosition; // used for styling borders
    date: Date; // the particular date represented by each column
    times: string[]; // a list of all 15-minute intervals to be displayed

    isDragging: boolean; // indicates whether user is dragging (i.e., a selection/de-selection is being made).
                         // When user isDragging, they'll be drawing a rectangular box over the panel region.

    horizontalBound: Date[]; // the horizontal bound of the user's rectangular selection box.
                             // horizontalBound[0] := the inclusive start of the box
                             // horizontalBound[1] := the inclusive end of the box

    addingTimes: boolean; // whether the user is selecting or deselecting time slots (if the user 
                          // had clicked on an already-selected time slot, they are de-selecting)

    isSelected: (date: Date, time: string) => boolean; // determines whether a given time slot (marked by date & time) 
                                                       // is part of user's dragged selection box.


    // timeSlotHovered: a callback function that runs when a user hovers over a time
    // slot. Affects states in DateColumn's parent component (i.e., TimeSelector).
    timeSlotHovered: (date: Date, time: string) => void; 

    // timeSlotClicked: a callback function that runs when a user clicks on a time
    // slot. Affects states in DateColumn's parent component (i.e., TimeSelector).
    timeSlotClicked: (date: Date, time: string, timeSlotActive: boolean) => void; 
}

const DateColumn: React.FC<DateColumnProps> = 
    ({ col_pos, date, times, isDragging, addingTimes, 
       isSelected, horizontalBound, timeSlotHovered, timeSlotClicked }) => {
    
    // to keep track of all selected time slots in this column. 
    // note: if a time slot is selected, it will stay selected until user de-selects it. 
    // So, even if a time slot was not part of user's most recently drawn selection-box, 
    // it will still be part of activeTimeSlots if it was selected at some point before.
    const [activeTimeSlots, setActiveTimeSlots] = useState<Set<string>>(new Set());

    // (for the purely cosmetic purpose of displaying the column's label)
    // dateDay[0] := the day (e.g., "Thu")
    // dateDay[1] := the date (e.g., "Dec 21")
    const dateDay = parseDayAndDate(date);

    // the following code runs when isDragging changes. I.e., when user either starts
    // dragging a selection or when user finishes dragging a selection.
    useEffect(() => {
        if (!isDragging && horizontalBound[0] <= date && date <= horizontalBound[1]) {
            const updatedSlots: Set<string> = new Set(activeTimeSlots);
            for (const time of times) {
                if (isSelected(date, time)) {
                    if (addingTimes) {
                        updatedSlots.add(time);
                    }
                    else {
                        updatedSlots.delete(time);
                    }
                }
            }
            setActiveTimeSlots(updatedSlots);
        }
    }, [isDragging])


    return(
        <div className='date-column'>
            <div className='date-column-header'
                 style={{borderLeft: col_pos === ColumnPosition.LeftMost ? '1px solid lightgrey' : '' }}>
                <h2>{dateDay[0]}</h2>
                <p>{dateDay[1]}</p>
            </div>
            <div className='date-column-timeslot-container'
                 style={{borderRight: col_pos !== ColumnPosition.RightMost ? '1px solid whitesmoke' : '' }}>
                {times.map((time, index) => {
                    return (
                        <div 
                        key={time}
                        className='selectable-time-slot'
                        style={{ 
                            borderBottom: (index + 1) % 4 === 0 ? '1px solid whitesmoke' : '',

                            // If the timeslot is currently within the user's selection box region, 
                            // its color depends solely on whether the user is adding times or deleting times.
                            // If not, the color depends on whether it was a previously selected time slot. 
                            backgroundColor: ((isSelected(date, time)) ? addingTimes : activeTimeSlots.has(time))  ? '#68b516' : 'lightgrey'
                        }}
                        onMouseDown={() => { 
                            timeSlotClicked(date, time, activeTimeSlots.has(time));
                        }}
                        onMouseEnter={() => {timeSlotHovered(date, time)}}>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
// ------------------------------
// ------------------------------ End of DateColumn component




// ------------------------------
// ------------------------------
// ** TimeSelector 

const TimeSelector = () => {

    // indicates whether user is dragging (i.e., a selection/de-selection is being made).
    // When user isDragging, they'll be drawing a rectangular box over the panel region.
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // whether the user is selecting or deselecting time slots (if the user 
    // had clicked on an already-selected time slot, they are de-selecting)
    const [addingTimes, setAddingTimes] = useState<boolean>(false);

    // the Date of the specific cell that the user clicked on to begin dragging a selection region.
    const [startCellDate, setStartCellDate] = useState<Date>(new Date());
    // the time of the specific cell that the user clicked on to begin dragging a selection region.
    const [startCellTime, setStartCellTime] = useState<string>('');

    // horizontal and vertical bounds of the user's selection region. Constantly 
    // changes as the user drags over time slots.
    const [horizontalBound, setHorizontalBound] = useState<Date[]>([new Date(), new Date()]);
    const [verticalBound, setVerticalBound] = useState<string[]>(['', '']);

    // callBack for when mouse is lifted (for when selection has been finished being drawn)
    // primary job is to set isDragging to false.
    const DraggingDone = () => {
        if (isDragging) {
            setIsDragging(false);

        }
    };
    useEffect(() => {
        if (!isDragging) {
            return;
        }
        document.addEventListener('mouseup', DraggingDone);
        return () => {
            document.removeEventListener('mouseup', DraggingDone);
        };
    }, [isDragging]);

    // function for determining whether a particular time slot is part of the selection box
    // being dragged/drawn by the user.
    const isSelected = (date: Date, time: string): boolean => {
        return (horizontalBound[0] <= date && date <= horizontalBound[1] &&
                verticalBound[0] <= time && time <= verticalBound[1]);
    }   

    // callback function for when user clicks on a particular time slot to being drawing a selection.
    // Function will be called from within a DateColumn component. 
    const timeSlotClicked = (date: Date, time: string, timeSlotActive: boolean): void => {
        setIsDragging(true);
        setAddingTimes(!timeSlotActive);
        setStartCellDate(date);
        setStartCellTime(time);
        setHorizontalBound([date, date]);
        setVerticalBound([time, time]);
    }

    // callback function for when user hovers over a particular time slot.
    // Function will be called from within a DateColumn component.
    const timeSlotHovered = (date: Date, time: string): void => {
        if (isDragging) {
            let min_horizontal_bound: Date = date < startCellDate ? date : startCellDate;
            let max_horizontal_bound: Date = date > startCellDate ? date : startCellDate;
            let min_vertical_bound: string = time < startCellTime ? time : startCellTime;
            let max_vertical_bound: string = time > startCellTime ? time : startCellTime;

            setVerticalBound([min_vertical_bound, max_vertical_bound]);
            setHorizontalBound([min_horizontal_bound, max_horizontal_bound]);
        }
    }
    
    const [times] = useState(getIntervals());
    const [dates] = useState(generateDates());
    
    return (
        <div className='time-selector'>
            <div className='times-labels-container'>
            <div className='header'></div>
            {times.map((time, index) => {
                if ((index + 1) % 4 !== 0) {
                    return;
                }
                return (
                    <div key={time} className='time-label'>
                        {convertTimestamp(time)}
                    </div>
                )
            })}
            </div>
            {dates.map((date, index) => {
                return (
                    <DateColumn
                    key={date.toISOString()}
                    col_pos={index === 0 ? ColumnPosition.LeftMost : 
                             (index === dates.length ? ColumnPosition.RightMost : ColumnPosition.Middle)}
                    date={date}
                    times={times}
                    isDragging={isDragging}
                    addingTimes={addingTimes}
                    isSelected={isSelected}
                    timeSlotHovered={timeSlotHovered}
                    timeSlotClicked={timeSlotClicked}
                    horizontalBound={horizontalBound}
                    ></DateColumn>
                )
            })}
        </div>
    );
};
// ------------------------------
// ------------------------------ End of TimeSelector


export default TimeSelector