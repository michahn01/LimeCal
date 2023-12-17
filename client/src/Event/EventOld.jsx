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
  
const Calendar = ({ updateSelectedDates }) => {

    const submitDates = (event) => {
        // make API request
        // console.log("submit dates")
        updateSelectedDates(selectedDates);
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

const DatesPanel = ({ userDates }) => {

    const [selectedTimes, setSelectedTimes] = useState(new Set());
    const [timeRange, setTimeRange] = useState(['', '']);

    const createEvent = (calendar, startStr, endStr) => {
        calendar.addEvent({
            start: startStr,
            end: endStr,
            backgroundColor: 'green',
            display: 'background'
        })
    }

    const handleTimeSelect = (selectInfo) => {
        const calendarApi = selectInfo.view.calendar;
        const allEvents = calendarApi.getEvents();

        let startDate = new Date(selectInfo.startStr);
        let endDate = new Date(selectInfo.endStr);
        
        const for_removal = [];
        let should_insert = true;
        for (const e of allEvents) {
            const eStart = new Date(e.startStr);
            const eEnd = new Date(e.endStr);
            if (eStart <= startDate) {
                if (endDate <= eEnd) {
                    should_insert = false;
                    const old_end = e.endStr;
                    for_removal.push(e);
                    if (eStart < startDate) {
                        createEvent(calendarApi, e.startStr, selectInfo.startStr);
                    }
                    if (endDate < eEnd) {
                        createEvent(calendarApi, selectInfo.endStr, e.endStr);
                    }
                    break;
                }
                else if (eEnd >= startDate) {
                    startDate = eStart;
                    for_removal.push(e);
                }
            }
            else {
                if (endDate >= eEnd) {
                    for_removal.push(e);
                }
                else if (endDate >= eStart) {
                    endDate = eEnd;
                    for_removal.push(e);
                }
            }
        }
        for (const e of for_removal) {
            e.remove();
        }
        if (should_insert) {
            createEvent(calendarApi, startDate, endDate);
        }
        calendarApi.unselect();
    }

    const panel_dates = ['2023-11-03', '2023-11-05', '2023-11-11','2023-11-02','2023-11-01'];

    const handleTimeChange = (startTime, endTime) => {
        setTimeRange([ startTime, endTime ]);
    };

    return (
        <div className='time-select-container'>
        <p>Now press and drag cursor over specific times when you're available:</p>
        <TimeRangeSelector onTimeChange={handleTimeChange}/>
        <div className='panel'>
            {userDates.map((date, index) => (
            <FullCalendar
            key={date}
            plugins={[ timeGridPlugin, interactionPlugin ]}
            initialView='timeGrid'
            selectable={true}
            allDaySlot={false}
            scrollTimeReset={false}
            initialDate={date}
            select={handleTimeSelect}
            eventOverlap={false}
            slotLabelInterval={'01:00:00'}
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
    
    const [calSelectedDates, setCalSelectedDates] = useState([]);
    const updateSelectedDates = (dates) => {
        const new_dates = Array.from(dates);
        new_dates.sort();
        setCalSelectedDates(new_dates);
    }

    return (
        <div className='page-body'>
            <div className='content-container'>
                {/* <button
                onClick={() => {setStep((step + 1) % 2)}}>switch</button> */}
                <div className='dates-select-container' >
                    <p>Select a date or dates when you can meet (click, drag mouse).</p>
                    <Calendar updateSelectedDates={updateSelectedDates}></Calendar>
                </div>
                <DatesPanel userDates={calSelectedDates}></DatesPanel>
            </div>
        </div>
    )
}

export default Event