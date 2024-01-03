import React, { useState, useRef } from "react"
import ReactSlider from 'react-slider'; 
import TimezoneSelect, { type ITimezone } from 'react-timezone-select'

import "./CreateEvent.css"
import "./DateSelectors.css"
import { CalendarSelector, WeeklySelector } from "./DateSelectors.tsx";
import type { CalendarSelectorMethods, WeeklySelectorMethods } from './DateSelectors.tsx';

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

    // whether user is selecting specific *dates* or *days* of the week
    const [selectingDates, setSelectingDates] = useState<boolean>(true);  

    const calendarSelectorRef = useRef<CalendarSelectorMethods>(null);
    const weeklySelectorRef = useRef<WeeklySelectorMethods>(null);

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

    const submitForm = () => {
        if (eventTitle.trimEnd() === "") {
            setSubmitMessage("Event title is required.")
            return;
        }
        let selection: string[];
        if (selectingDates) {
            const dates: Set<string> | undefined = calendarSelectorRef.current?.fetchSelection();
            if (dates === undefined) {
                setSubmitMessage("Something went wrong. Please try again.");
                return;
            }
            if (dates.size === 0) {
                setSubmitMessage("Please select at least 1 date.");
                return;
            }
            selection = Array.from(dates).sort();
        }
        else {
            const days: Array<boolean> | undefined = weeklySelectorRef.current?.fetchSelection();
            if (days === undefined) {
                setSubmitMessage("Something went wrong. Please try again.");
                return;
            }
            selection = [];
            for (let i = 0; i < days.length; ++i) {
                if (days[i]) {
                    selection.push(String(i));
                }
            }
            if (selection.length === 0) {
                setSubmitMessage("Please select at least 1 day.");
                return;
            }
        }
        console.log(selection);
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

                        <div className='dates-select-container'>
                            <div className='date-selection-toggle-button'>
                                <div id='toggle-left' onClick={() => {setSelectingDates(true); setSubmitMessage('')}}
                                style={{backgroundColor: selectingDates ? 'purple' : '',
                                        color: selectingDates ? 'white' : '#272727'}}
                                >Specific Dates</div>
                                <div id='toggle-right' onClick={() => {setSelectingDates(false); setSubmitMessage('')}}
                                style={{backgroundColor: selectingDates ? '' : 'purple',
                                        color: selectingDates ? '#272727' : 'white'}}
                                >Days of the Week</div>
                            </div>
                            <CalendarSelector active={selectingDates} ref={calendarSelectorRef}></CalendarSelector>
                            <WeeklySelector active={!selectingDates} ref={weeklySelectorRef}></WeeklySelector>
                            <p>Click and drag over {selectingDates ? "dates" : "days"} you want to select.</p>
                        </div>
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