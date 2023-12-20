import React, { useState, useEffect } from 'react';
import './css/TimeSelector.css'



enum ColumnPosition {
    LeftMost, 
    Middle,
    RightMost
}
type DateColumnProps = {
    col_pos: ColumnPosition;
    date: Date;
    times: string[];
    isDragging: boolean;
    addingTimes: boolean;
    isSelected: (date: Date, time: string) => boolean;
    timeSlotHovered: (date: Date, time: string) => void;
    timeSlotClicked: (date: Date, time: string, timeSlotActive: boolean) => void;
    horizontalBound: Date[];
}
const DateColumn: React.FC<DateColumnProps> = 
    ({ col_pos, date, times, isDragging, addingTimes, isSelected, timeSlotHovered, timeSlotClicked, horizontalBound }) => {
    const [activeTimeSlots, setActiveTimeSlots] = useState<Set<string>>(new Set());
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
                <h2>Day</h2>
                <p>date</p>
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
                            backgroundColor: ((isSelected(date, time)) ? addingTimes : activeTimeSlots.has(time))  ? '#68b516' : 'lightgrey'
                        }}
                        onMouseDown={() => { 
                            timeSlotClicked(date, time, activeTimeSlots.has(time));
                        }}
                        onMouseEnter={() => {timeSlotHovered(date, time)}}
                        >
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const TimeSelector = () => {

    // To select a range of time slots, the user will drag-select over 
    // multiple panels of dates. When that happens, a "selection box"
    // will be drawn invisibly. Time slots that fall within this selection 
    // box will be highligted.

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [addingTimes, setAddingTimes] = useState<boolean>(false);
    const [startCellDate, setStartCellDate] = useState<Date>(new Date());
    const [startCellTime, setStartCellTime] = useState<string>('');
    const [horizontalBound, setHorizontalBound] = useState<Date[]>([new Date(), new Date()]);
    const [verticalBound, setVerticalBound] = useState<string[]>(['', '']);


    const DraggingDone = () => {
        if (isDragging) {
            setIsDragging(false);

        }
    };
    useEffect(() => {
        if (!isDragging) {
            return;
        }
        // Add event listener for mouseup to the whole document
        document.addEventListener('mouseup', DraggingDone);
        // Clean up the event listener
        return () => {
            document.removeEventListener('mouseup', DraggingDone);
        };
    }, [isDragging]);


    const isSelected = (date: Date, time: string): boolean => {
        // console.log("run")
        return (horizontalBound[0] <= date && date <= horizontalBound[1] &&
                verticalBound[0] <= time && time <= verticalBound[1]);
    }   

    const timeSlotClicked = (date: Date, time: string, timeSlotActive: boolean): void => {
        setIsDragging(true);
        setAddingTimes(!timeSlotActive);
        setStartCellDate(date);
        setStartCellTime(time);
        setHorizontalBound([date, date]);
        setVerticalBound([time, time]);
    }

    const timeSlotHovered = (date: Date, time: string): void => {
        if (isDragging) {
            // console.log("HOVERED", date, time)
            let min_horizontal_bound: Date = date < startCellDate ? date : startCellDate;
            let max_horizontal_bound: Date = date > startCellDate ? date : startCellDate;
            let min_vertical_bound: string = time < startCellTime ? time : startCellTime;
            let max_vertical_bound: string = time > startCellTime ? time : startCellTime;

            setVerticalBound([min_vertical_bound, max_vertical_bound]);
            setHorizontalBound([min_horizontal_bound, max_horizontal_bound]);
        }
    }

    const getIntervals = (): string[] => {
        const intervals = [];
        const currentDate = new Date();
        
        const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endTime = new Date(startTime.getTime());
        endTime.setHours(endTime.getHours() + 8); 
    
        for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 15)) {
            intervals.push(time.toISOString().split('T')[1].split('.')[0]);
        }
    
        return intervals;
    };

    const generateDates = (): Date[] => {
        let dates: Date[] = [];
        let currentDate = new Date();
      
        for (let i = 0; i < 10; i++) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      
        return dates;
      }
    
    const [times] = useState(getIntervals());
    const [dates] = useState(generateDates());
    
    return (
        <div className='time-selector'>
            {dates.map((date, index) => {
                return (
                    <DateColumn
                    key={index}
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


export default TimeSelector