import TimeSelector from './TimeSelector.tsx';
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useParams } from 'react-router-dom';
import TimezoneSelect, { type ITimezone } from 'react-timezone-select'

import axiosConfig from '../axios.ts';

import "./css/Event.css"


type AvailabilityTableMethods = {
  setAvailableUsers: (times: string[]) => void;
  setUnavailableUsers: (times: string[]) => void;
};
const AvailabilityTable = forwardRef<AvailabilityTableMethods, {}>((_, ref) => {
  const [available, setAvailable] = useState<string[]>([]);
  const [unavailable, setUnavailable] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    setAvailableUsers: (users: string[]) => {
      setAvailable(users);
    },
    setUnavailableUsers: (users: string[]) => {
      setUnavailable(users);
  }
}));
  return (
    <div className='availability-table'>
    <div className='table-header'>
      <div className='column-entry'>Available</div>
      <div className='column-entry'>Unavailable</div>
    </div>
    <div className='table-body'>
      <div className='body-column left-column'>
        {available.map((user: string) => {
          return <p key={user} >{user}</p>
        })}
      </div>
      <div className='body-column'>
        {unavailable.map((user: string) => {
          return <p key={user}>{user}</p>
        })}
      </div>
    </div>
  </div>
  )
});

enum addingMode {
  view = 0,
  enteringName,
  enteringTimes
};
const Event = () => {
    let { eventId } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [pageFound, setPageFound] = useState<boolean>(true);
    const [viewWindowRange, setViewWindowRange] = useState<string[]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [timezone, setTimezone] = useState<string>('');
    const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>('America/Detroit')

    const [addingAvailability, setAddingAvailability] = useState<addingMode>(addingMode.view);
    const [userName, setUserName] = useState<string>("");

    const availabilityTable = useRef<AvailabilityTableMethods>(null);
    // console.log("refreshing event")
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
            <div className="control-panel">
            {
                (addingAvailability === addingMode.enteringName) ?
                    (
                        <div className="name-form">
                            <form>
                                Enter your name:
                                <input type="text" 
                                       className="name-input" 
                                       name="name" 
                                       onChange={(data) => {setUserName(data.target.value)}}/>

                                <div className="button-group">
                                    <button type="button" 
                                    onClick={() => {
                                      setAddingAvailability(addingMode.enteringTimes);
                                    }}
                                    className="name-field-button continue">
                                    Continue</button>
                                    <button type="button" 
                                    onClick={() => {
                                      setAddingAvailability(addingMode.view);
                                    }}
                                    className="name-field-button cancel">
                                    Cancel</button>
                                </div>
                            </form>
                        </div>
                    )
                :
                    (
                      <div className='buttons-row'>
                        <button 
                            className='control-panel-button' 
                            onClick={() => {
                                      if (addingAvailability === addingMode.view)
                                      setAddingAvailability(addingMode.enteringName);
                                      else 
                                      setAddingAvailability(addingMode.view);
                                    }}
                        >
                            {addingAvailability === addingMode.view ? "Enter Availability" : "Done"}
                        </button>
                        <button className='control-panel-button' 
                        onClick={() => {navigator.clipboard.writeText(window.location.href);}}>
                          Copy Link
                        </button>
                      </div>
                    )
            }
            <p>If you're a returning user, sign in with the same name.</p>
            <AvailabilityTable ref={availabilityTable}></AvailabilityTable>
          </div>
          <div className='time-selector-group'>
            <div className='time-selector-top-header'> 
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
            </div>

            <div className='time-selector-top-header'> 
            {(addingAvailability === addingMode.enteringTimes) ? 
            (<div>Entering {userName}'s availability:</div>) :
            (<div>Everyone's availability:</div>)}
            </div>

            <TimeSelector viewWindowRange={viewWindowRange} 
                          dates={dates} 
                          timezone={timezone}
                          addingAvailability={addingAvailability === addingMode.enteringTimes}
                          userName={userName}
                          eventPublicId={eventId ? eventId : ""}
                          availabilityTable={availabilityTable}>
            </TimeSelector>
          </div>

        </div>
    )
}

export default Event

