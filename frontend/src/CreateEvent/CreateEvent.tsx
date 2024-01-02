import React, { useState } from "react"
import ReactSlider from 'react-slider'; 
import moment from 'moment-timezone';
import TimezoneSelect, { type ITimezone } from 'react-timezone-select'

import "./CreateEvent.css"
import DateSelector from "./DateSelector";

// converts hh:mm:ss to "X AM" or "Y PM" format
const convertTimestamp = (timestamp: string): string => {
    const hoursString = timestamp.split(':')[0];
    let hours = parseInt(hoursString);

    const amPm = (hours < 12 || hours === 24) ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;

    return `${hours} ${amPm}`;
}

const Create = () => {
    const [eventTitle, setEventTitle] = useState<string>("");
    const [submitMessage, setSubmitMessage] = useState<string>("");

    const [calSelectedDates, setCalSelectedDates] = useState<string[]>([]);

    // viewWindowRange contains the inclusive start and inclusive end times of the 
    // viewing window of the selection panel. The user can adjust the range of time 
    // slots using the 'time-range-selector-slider'.
    const [viewWindowRange, setViewWindowRange] = useState<string[]>(["08:00", "17:00"]);

    // labels on the time-range-selector-slider
    const [sliderLabels, setSliderLabels] = useState(["8 AM", "5 PM"]);

    const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
        Intl.DateTimeFormat().resolvedOptions().timeZone
      )


    const sendApiRequest = () => {

    }

    const updateSelectedDates = (dates: Set<string>): void => {
        const new_dates: Array<string> = Array.from(dates);
        new_dates.sort();
        setCalSelectedDates(new_dates);
    }

    const submitForm = () => {
        if (eventTitle.trimEnd() == "") {
            setSubmitMessage("Event title is required.")
            return;
        }
        sendApiRequest();
    }

    // callback function for when user uses the time range slider to adjust the
    // time interval to be displayed on the selection panel's viewing window.
    // thumbValue := values of the thumbs on the slider.
    const sliderAfterChange = (thumbValue: number[], _: number) => {
        const newRange: string[] = [`${thumbValue[0]}:00`.padStart(5, '0'), `${thumbValue[1]}:00`.padStart(5, '0')]
        setViewWindowRange(newRange);
    }
    const sliderOnChange = (thumbValue: number[], _: number) => {
        const newRange: string[] = [`${thumbValue[0]}:00`.padStart(5, '0'), `${thumbValue[1]}:00`.padStart(5, '0')]
        setSliderLabels(newRange);
    }

    return (
        <div id="page-body">
            <div className="form-container">
                
                <div className="form-group">
                <h1>Create a New Event</h1>
                <input type="text" id="title" name="event_title" required
                    value={eventTitle} 
                    placeholder="Event Title"
                    onChange={(e) => {setSubmitMessage(""); setEventTitle(e.target.value)}}>
                </input>
                </div>

                <div className='time-selection-area'>
                    <div className='date-selection-column'>
                        <h2>What dates might work?</h2>

                        <DateSelector></DateSelector>
                    </div>
                    <div className='time-selection-column'>
                        <h2>What times might work?</h2>

                        <div className='slider-area'>
                        <div>
                            <div className="slider-times">{convertTimestamp(sliderLabels[0])} - {convertTimestamp(sliderLabels[1])}</div>
                            <ReactSlider
                            className="time-range-selector-slider"
                            thumbClassName="slider-thumb"
                            trackClassName="slider-track"
                            defaultValue={[8, 17]}
                            ariaLabelledby={['first-slider-label', 'second-slider-label']}
                            ariaValuetext={state => `Thumb value ${state.valueNow}`}
                            renderThumb={(props, _) => <div {...props}></div>}
                            pearling
                            minDistance={1}
                            min={0}
                            max={24}
                            onAfterChange={sliderAfterChange}
                            onChange={sliderOnChange}
                            />
                        </div>
                        <p className="slider-instruction">
                            Respondees will specify their availabilities within 
                            this time interval.
                        </p>
                        </div>

                        <h3>Timezone:</h3>
                        <TimezoneSelect 
                        value={selectedTimezone}
                        onChange={setSelectedTimezone}
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
                </div>

                {submitMessage != "" && <p style={{color:'red', marginTop: '0px'}}>{submitMessage}</p>}
                
                <button onClick={submitForm} className="create-event-button">Create</button>
            </div>
        </div>
    )
}

export default Create