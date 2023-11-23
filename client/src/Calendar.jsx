import React from 'react'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';

// for calendar styling
import "./css/custom_cal.css"

const Calendar = () => {
  return (
    <div className="calendar-container">
        <FullCalendar 
        aspectRatio={1.35}
        plugins={[ dayGridPlugin, timeGridPlugin ]}
        initialView='dayGridMonth'
        headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        }}>
        </FullCalendar>
    </div>
  )
}

export default Calendar