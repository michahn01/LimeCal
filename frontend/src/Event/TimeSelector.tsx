import React, { useState } from 'react';
import './css/TimeSelector.css'


type TimeSlotProps = {
    index: number;
}
const TimeSlot: React.FC<TimeSlotProps> = ({ index }) => {
    return (
        <div className='selectable-time-slot' 
        style={{borderBottom: (index + 1) % 4 == 0 ? '1px solid whitesmoke' : '' }}
        onClick={() => {}}></div>
    )
}

enum ColumnPosition {
    LeftMost, 
    Middle,
    RightMost
}
type DateColumnProps = {
    col_pos: ColumnPosition;
    date: string;
    day: string;
    times: string[];
}
const DateColumn: React.FC<DateColumnProps> = ({ col_pos, date, day, times }) => {
    return(
        <div className='date-column'>
            <div className='date-column-header'
                 style={{borderLeft: col_pos == ColumnPosition.LeftMost ? '1px solid lightgrey' : '' }}>
                <h2>{day}</h2>
                <p>{date}</p>
            </div>
            <div className='date-column-timeslot-container'
                 style={{borderRight: col_pos != ColumnPosition.RightMost ? '1px solid whitesmoke' : '' }}>
                {times.map((time, col_index) => {
                    return (
                        <TimeSlot key={time} index={col_index}></TimeSlot>
                    )
                })}
            </div>
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
        
        const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endTime = new Date(startTime.getTime());
        endTime.setHours(endTime.getHours() + 8); 
    
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
            <DateColumn col_pos={ColumnPosition.LeftMost} date='Dec 16' day='Sat' times={times}></DateColumn>
            <DateColumn col_pos={ColumnPosition.Middle} date='Dec 17' day='Sun' times={times}></DateColumn>
            <DateColumn col_pos={ColumnPosition.Middle} date='Dec 18' day='Mon' times={times}></DateColumn>
            <DateColumn col_pos={ColumnPosition.Middle} date='Dec 19' day='Tue' times={times}></DateColumn>
            <DateColumn col_pos={ColumnPosition.RightMost} date='Dec 20' day='Wed' times={times}></DateColumn>
        </div>
    );
};


export default TimeSelector