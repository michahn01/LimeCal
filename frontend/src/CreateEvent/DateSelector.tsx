// a calendar UI for selecting dates
import { useState, useEffect } from 'react'
import './DateSelector.css'

const getFirstDateOfMonth = (date: Date): Date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1);
}

const getLastDateOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

const getMonth = (monthIndex: number): string => {
    return ["January", "February", "March", "April", "May", "June", "July", 
    "August", "September", "October", "November", "December"][monthIndex];
}

const days: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DateSelector = () => {
    // "today" will be highlighted in the calendar
    const [today] = useState<Date>(new Date());
    // the first date of the month currently in display
    const [currentMonthFirst, setCurrentMonthFirst] = useState<Date>(() => getFirstDateOfMonth(today));
    // last date of current month
    const [currentMonthLast, setCurrentMonthLast] = useState<Date>(() => getLastDateOfMonth(today));

    // firstDates will hold the first date of every row to be displayed on the calendar.
    const [firstDates, setFirstDates] = useState<Date[]>([]);

    // whether a selection box is being dragged
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // whether the area being drawn/dragged is a selection or de-selection
    const [isAdding, setIsAdding] = useState<boolean>(false);

    const [startCellRowIndex, setStartCellRowIndex] = useState<Date>(new Date());
    const [startCellRowOffset, setStarCellRowOffset] = useState<number>(0);

    // horizontal bound of selection box, as the i-th date of a calendar row
    const [horizontalBound, setHorizontalBound] = useState<number[]>([]);

    // vertical bound of selection box, represented by the first date of each row
    const [verticalBound, setVerticalBound] = useState<Date[]>([]);

    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

    
    useEffect(() => {
        const dates: Date[] = [];

        const currentDate: Date = new Date(currentMonthFirst);
        currentDate.setDate(currentDate.getDate() - currentDate.getDay());

        while (currentDate <= currentMonthLast) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        setFirstDates(dates);
    }, []);

    const handleMonthChange = (change: number) => {
        const newMonthFirst: Date = new Date(currentMonthFirst);
        newMonthFirst.setMonth(newMonthFirst.getMonth() + change);
        newMonthFirst.setDate(1);
        setCurrentMonthFirst(newMonthFirst);

        const currentDate: Date = new Date(newMonthFirst);

        const dates: Date[] = [];
        const lastDate: Date = getLastDateOfMonth(currentDate);
        setCurrentMonthLast(lastDate);

        currentDate.setDate(currentDate.getDate() - currentDate.getDay());

        while (currentDate <= lastDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 7);
        }

        setFirstDates(dates);
    }

    const DraggingDone = () => {
        if (isDragging) {
            setIsDragging(false);
        }
    };
    useEffect(() => {
        if (!isDragging && verticalBound.length > 1) {
            const newSelectedDates: Set<string> = new Set(selectedDates);
            for (let i: Date = new Date(verticalBound[0]); i <= verticalBound[1]; i.setDate(i.getDate() + 7)) {
                const currDate: Date = new Date(i);
                currDate.setDate(currDate.getDate() + horizontalBound[0]);
                for (let j: number = horizontalBound[0]; j <= horizontalBound[1]; ++j) {
                    if (isAdding) {
                        newSelectedDates.add(currDate.toISOString());
                    }
                    else {
                        newSelectedDates.delete(currDate.toISOString());
                    }
                    currDate.setDate(currDate.getDate() + 1);
                }
            }
            setSelectedDates(newSelectedDates);
            return;
        }
        document.addEventListener('mouseup', DraggingDone);
        return () => {
            document.removeEventListener('mouseup', DraggingDone);
        };
    }, [isDragging]);

    // callback function for when a cell representing a date is clicked
    // 'cellActive' := whether a cell is already selected
    const dateCellClicked = (cellActive: boolean, rowDate: Date, cellIndex: number) => {
        if (!isDragging) {
            setIsDragging(true);
            setIsAdding(!cellActive);
            setStartCellRowIndex(rowDate);
            setStarCellRowOffset(cellIndex);
            setHorizontalBound([cellIndex, cellIndex]);
            setVerticalBound([rowDate, rowDate]);
        }
    }
    const dateCellHovered = (rowDate: Date, cellIndex: number) => {
        if (isDragging) {

            let min_horizontal_bound: number = cellIndex < startCellRowOffset ? cellIndex : startCellRowOffset;
            let max_horizontal_bound: number = cellIndex > startCellRowOffset ? cellIndex : startCellRowOffset;
            let min_vertical_bound: Date = rowDate < startCellRowIndex ? rowDate : startCellRowIndex;
            let max_vertical_bound: Date = rowDate > startCellRowIndex ? rowDate : startCellRowIndex;

            setVerticalBound([min_vertical_bound, max_vertical_bound]);
            setHorizontalBound([min_horizontal_bound, max_horizontal_bound]);
        }
    }

    // returns whether a cell is part of the selection box currently being drawn
    const isSelected = (rowDate: Date, cellIndex: number): boolean => {
        return !(verticalBound[0] > rowDate || rowDate > verticalBound[1] ||
                horizontalBound[0] > cellIndex || cellIndex > horizontalBound[1]);
    }

    return (
        <div className='dates-select-container'>
            <div className='calendar-control-bar'>
                <button className='control-button left' onClick={() => {handleMonthChange(-1)}}></button>
                <div>{getMonth(currentMonthFirst.getMonth())} {currentMonthFirst.getFullYear()}</div>
                <button className='control-button right' onClick={() => {handleMonthChange(1)}}></button>
            </div>
            <div className='calendar-row'>
            {days.map((day) => {
                return (
                    <div key={day} className='calendar-header-cell'>
                        {day}
                    </div>
                )
            })}
            </div>
            {firstDates.map((rowDate) => {
                const currentDate: Date = new Date(rowDate);
                const rowDates: Date[] = [];
                for (let i: number = 0; i < 7; ++i) {
                    rowDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return (
                    <div key={rowDate.toISOString()} className='calendar-row'>
                        {rowDates.map((cellDate, cellIndex) => {
                            return (
                                <div key={cellDate.toISOString()} className='calendar-date'
                                onMouseDown={() => {dateCellClicked(selectedDates.has(cellDate.toISOString()), rowDate, cellIndex)}}
                                onMouseEnter={() => {dateCellHovered(rowDate, cellIndex)}}
                                style={{borderLeft: cellIndex === 0 ? '1px solid lightgrey' : '',
                                        color: cellDate < currentMonthFirst || cellDate > currentMonthLast ? 
                                        'lightgrey' : '#5c5c5c', 
                                        backgroundColor: isSelected(rowDate, cellIndex) ? (isAdding ? '#68b516' : '') : 
                                        (selectedDates.has(cellDate.toISOString()) ? '#68b516' : '')}}>
                                    {cellDate.getDate()}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export default DateSelector