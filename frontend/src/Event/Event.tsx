import TimeSelector from './TimeSelector.jsx';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TimezoneSelect, { type ITimezone } from 'react-timezone-select'

import axiosConfig from '../axios.ts';

import "./css/Event.css"


const Event = () => {
    let { eventId } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [pageFound, setPageFound] = useState<boolean>(true);
    const [viewWindowRange, setViewWindowRange] = useState<string[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [timezone, setTimezone] = useState<string>('');

    const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>('America/Detroit')

    useEffect(() => {
      axiosConfig.get(`/event/${eventId}`)
      .then((response) => {
        setPageFound(true);
        setLoading(false);
        setViewWindowRange([response.data.start_time, response.data.end_time]);
        setDates(response.data.dates);
        setTimezone(response.data.timezone);
        setSelectedTimezone(response.data.timezone);
      })
      .catch(() => {
        setPageFound(false);
        setLoading(false);
      })
      
    }, [])

    if (loading) {
      return (
        <div></div>
      )
    }
    if (!pageFound) {
      return (
        <div className="centered-box">
          <p style={{color: 'whitesmoke', 
                    marginTop: '150px',
                    fontSize: '28px'}}>
          The page you were looking for cannot be found.</p>
        </div>
      )
    }
    return (
        <div className='page-body'>
            <TimezoneSelect 
            value={selectedTimezone}
            onChange={(tz: any) => {setSelectedTimezone(tz); setTimezone(tz.value);}}
            classNamePrefix="selector"
            styles={{
                control: (base) => ({
                  ...base,
                  width: '300px'
                }),
                menu: (base) => ({
                  ...base
                })
              }}
            />
            <TimeSelector viewWindowRange={viewWindowRange} dates={dates} timezone={timezone}></TimeSelector>
        </div>
    )
}

export default Event

