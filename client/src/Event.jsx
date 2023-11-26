import React from 'react'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import TimeRangeSelector from './TimeRangeSelector';

import "./css/Event.css"
// for calendar styling
import "./css/calendars.css"

import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const toLocalISODateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
  
const Calendar = () => {

    const submitDates = (event) => {
        // make API request
    }

    const [selectedDates, setSelectedDates] = useState(new Set());

    const handleDateSelect = (selectInfo) => {
        const calendarApi = selectInfo.view.calendar;

        const start_date = selectInfo.startStr.split("-");
        const startDate = new Date(start_date[0], start_date[1]-1, start_date[2]);
        const end_date = selectInfo.endStr.split("-");
        const endDate = new Date(end_date[0], end_date[1]-1, end_date[2]);

        // if both the start and end date in the range of dates selected is 
        // an already-selected date, then dates in the selected
        // range should be unselected.
        const incl_end = new Date(endDate);
        incl_end.setDate(incl_end.getDate() - 1);
        if (selectedDates.has(startDate.toISOString()) && 
            selectedDates.has(incl_end.toISOString())) {
            const new_dates = new Set(selectedDates);
            for (let date = new Date(startDate); date < endDate; 
                date.setDate(date.getDate() + 1)) {
                    if (!new_dates.has(date.toISOString())) continue;
                    calendarApi.getEventById(date.toISOString()).remove();
                    new_dates.delete(date.toISOString());
            }
            setSelectedDates(new_dates);
            calendarApi.unselect();
            return;
        }

        // iterate over each day in the range
        const dates = [];
        for (let date = new Date(startDate); date < endDate; 
            date.setDate(date.getDate() + 1)) {

            if (selectedDates.has(date.toISOString())) continue;
            dates.push(date.toISOString());
            calendarApi.addEvent({
                id: date.toISOString(),
                start: toLocalISODateString(date),
                allDay: selectInfo.allDay,
                backgroundColor: 'red',
                display: 'background'
            });
        }
      
        calendarApi.unselect();
        setSelectedDates(new Set([...selectedDates, ...dates]));
    };

    // to-do: once api server calls are established and loading times become a thing, 
    // make sure these also go in the loading phase
    var now = new Date();
    var sixMonthsBefore = new Date(now.setMonth(now.getMonth() - 6)).toISOString().split('T')[0];    
    var oneYearAfter = new Date(now.setMonth(now.getMonth() + 18)).toISOString().split('T')[0];
    // console.log(sixMonthsBefore); console.log(oneYearAfter);

    return (
      <div className="month-cal-container">
          <FullCalendar 
        //   aspectRatio={1.35}
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          initialView='dayGridMonth'
          selectable={true}
          select={handleDateSelect}
          visibleRange={{            
            start: sixMonthsBefore,
            end: oneYearAfter
          }}
          validRange={{            
            start: sixMonthsBefore,
            end: oneYearAfter
          }}
          handleWindowResize={true}
          contentHeight="auto"
        //   showNonCurrentDates={false}
          fixedWeekCount={false}
          headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'today'
          }}>
          </FullCalendar>

          <button className="submit-button"
           onClick={submitDates}>Use these dates</button>
      </div>
    )
}

const DatesPanel = () => {
    const eventDatesList = ['2023-11-03', '2023-11-05', '2023-11-11'];

    const [selectedTimes, setSelectedTimes] = useState(new Set());
    const [timeRange, setTimeRange] = useState(['', '']);

    const handleTimeSelect = (selectInfo) => {
        const calendarApi = selectInfo.view.calendar;

        const start_info = selectInfo.startStr.split("T");
        const start_date = start_info[0].split("-");
        const start_time = start_info[1].split(":");
        const startTime = new Date(start_date[0], start_date[1]-1, start_date[2], start_time[0], start_time[1]);
        const end_info = selectInfo.endStr.split("T");
        const end_date = end_info[0].split("-");
        const end_time = end_info[1].split(":");
        const endTime = new Date(end_date[0], end_date[1]-1, end_date[2], end_time[0], end_time[1]);

        // if both the start and end date in the range of dates selected is 
        // an already-selected date, then dates in the selected
        // range should be unselected.
        const incl_end = new Date(endTime);
        incl_end.setMinutes(incl_end.getMinutes() - 30);
        if (selectedTimes.has(startTime.toISOString()) && 
            selectedTimes.has(incl_end.toISOString())) {
            const new_times = new Set(selectedTimes);
            for (let date = new Date(startTime); date < endTime; 
                date.setMinutes(date.getMinutes() + 30)) {
                    if (!new_times.has(date.toISOString())) continue;
                    calendarApi.getEventById(date.toISOString()).remove();
                    new_times.delete(date.toISOString());
            }
            setSelectedTimes(new_times);
            calendarApi.unselect();
            return;
        }

        // iterate over each 30-minute chunk in the range
        const dates = [];
        let date = new Date(startTime);
        while ( date < endTime ) {
            const now = new Date(date);
            date.setMinutes(date.getMinutes() + 30)
            if (selectedTimes.has(now.toISOString())) continue;
            dates.push(now.toISOString());
            console.log(now.toISOString());
            calendarApi.addEvent({
                id: now.toISOString(),
                start: toLocalISODateString(now),
                end: toLocalISODateString(date),
                allDay: selectInfo.allDay,
                backgroundColor: 'green',
                display: 'background'
            });
        }
      
        calendarApi.unselect();
        setSelectedTimes(new Set([...selectedTimes, ...dates]));
    };


    const panel_dates = ['2023-11-03', '2023-11-05', '2023-11-11','2023-11-02','2023-11-01'];

    const handleTimeChange = (startTime, endTime) => {
        setTimeRange([ startTime, endTime ]);
    };


    return (
        <div className='time-select-container'>
        <p>Now press and drag cursor over specific times when you're available:</p>
        <TimeRangeSelector onTimeChange={handleTimeChange}/>
        {/* <button onClick={() => {console.log(timeRange[0])}}>Check</button> */}
        <div className='panel'>
            {panel_dates.map((date, index) => (
            <FullCalendar
            plugins={[ timeGridPlugin, interactionPlugin ]}
            initialView='timeGrid'
            selectable={true}
            allDaySlot={false}
            scrollTimeReset={false}
            initialDate={date}
            select={handleTimeSelect}
            contentHeight={"auto"}
            slotMinTime={timeRange[0] === '' ? '07:00:00' : timeRange[0]}
            slotMaxTime={timeRange[1] === '' ? '19:00:00' : timeRange[1]}
            dayHeaderFormat={
                { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }
            }
            headerToolbar={{
                left: '',
                center: '',
                right: ''
            }}>
            </FullCalendar>
            ))}
        </div>
        </div>

    )
}






const Event = () => {
    const params = useParams();
    const eventId = params.eventId;
    return (
        <div className='page-body'>
            <div className='content-container'>
                {/* <button
                onClick={() => {setStep((step + 1) % 2)}}>switch</button> */}
                <div className='dates-select-container' >
                    <p>Select a date or dates when you're available (click or drag).</p>
                    <Calendar></Calendar>
                </div>
                <DatesPanel></DatesPanel>
            </div>
        </div>


    )
}

export default Event