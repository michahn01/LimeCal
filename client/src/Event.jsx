import React from 'react'
import "./css/Event.css"

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';

// for calendar styling
import "./css/custom_cal.css"

import { useParams } from 'react-router-dom';
import { useState } from 'react';
  
const Calendar = () => {

    const [selectedDates, setSelectedDates] = useState(new Set());

    const toLocalISODateString = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

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

        let dates = [];

        // iterate over each day in the range
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
    return (
      <div className="calendar-container">
          <FullCalendar 
          aspectRatio={1.35}
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          initialView='dayGridMonth'
          selectable={true}
          select={handleDateSelect}
          headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
          }}>
          </FullCalendar>
      </div>
    )
  }

const Event = () => {
    const params = useParams();
    const eventId = params.eventId;
    return (
        <div className='page-body'>
            <Calendar style={{width: '100px'}}></Calendar>
        </div>
    )
}

export default Event