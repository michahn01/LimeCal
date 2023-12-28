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
            {firstDates.map((firstDate) => {
                const currentDate: Date = new Date(firstDate);
                const rowDates: Date[] = [];
                for (let i: number = 0; i < 7; ++i) {
                    rowDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return (
                    <div key={firstDate.toISOString()} className='calendar-row'>
                        {rowDates.map((cellDate, cellIndex) => {
                            return (
                                <div key={cellDate.toISOString()} className='calendar-date'
                                style={{borderLeft: cellIndex === 0 ? '1px solid lightgrey' : '',
                                        color: cellDate < currentMonthFirst || cellDate > currentMonthLast ? 
                                        'lightgrey' : '#5c5c5c'}}>
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