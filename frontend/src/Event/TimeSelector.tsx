import React, { useState } from 'react';
import './css/TimeSelector.css'



const TimeSlot = () => {
    return (
        <div className='time-slot'></div>
    )
}

// date should be an ISO representation of the column's date
// times is an array containing all timeslots in ISO that should be displayed
type DateColumnProps = {
    date: string;
    times: string[];
}
const DateColumn: React.FC<DateColumnProps> = ({ date, times }) => {
    return(
        <div className='date-column'>
            <div className='date-column-header'>
                {date}
            </div>
            {times.map((time) => {
                return (
                    <TimeSlot key={time}></TimeSlot>
                )
            })}
        </div>
    )
}


const TimeSelector = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    

    const onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        setStartPos({ x: e.clientX, y: e.clientY });
        setCurrentPos({ x: e.clientX, y: e.clientY });
        setIsDragging(true);
    };

    const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (isDragging) {
            setCurrentPos({ x: e.clientX, y: e.clientY });
        }
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const getIntervals = () => {
        const intervals = [];
        const currentDate = new Date();
        
        // Setting the start time to the beginning of today
        const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endTime = new Date(startTime.getTime());
        endTime.setDate(endTime.getDate() + 1); // Move to the start of the next day
    
        for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 15)) {
            intervals.push(time.toISOString());
        }
    
        return intervals;
    };
    
    const [times] = useState(getIntervals());

    const selectionBoxStyle: React.CSSProperties = {
        left: Math.min(startPos.x, currentPos.x),
        top: Math.min(startPos.y, currentPos.y),
        width: Math.abs(startPos.x - currentPos.x),
        height: Math.abs(startPos.y - currentPos.y),
        position: 'fixed',
        border: '2px dashed blue',
        pointerEvents: 'none', // To allow mouse events on underlying elements
        display: isDragging ? 'block' : 'none',
    };
    return (
        <div className='time-selector' onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
            <div style={selectionBoxStyle} />
            <DateColumn date={times[0]} times={times}></DateColumn>
        </div>
    );
};


export default TimeSelector