import React, { useState } from "react"
import ReactSlider from 'react-slider'; 

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
    const [password, setPassword] = useState<string>("");
    const [password2, setPassword2] = useState<string>("");
    const [submitMessage, setSubmitMessage] = useState<string>("");

    const [calSelectedDates, setCalSelectedDates] = useState<string[]>([]);

    // viewWindowRange contains the inclusive start and inclusive end times of the 
    // viewing window of the selection panel. The user can adjust the range of time 
    // slots using the 'time-range-selector-slider'.
    const [viewWindowRange, setViewWindowRange] = useState<string[]>(["08:00", "17:00"]);

    // labels on the time-range-selector-slider
    const [sliderLabels, setSliderLabels] = useState(["8 AM", "5 PM"]);


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
        if (password != "" && password != password2) {
            return;
        }
        sendApiRequest();
    }

    const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setSubmitMessage("");
        if (e.target.value == "") {
            setPassword2("");
        }
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
            <div id="event-form">
                <h2>Create a New Event</h2>
                
                <div className="form-group">
                <label htmlFor="title">Event Title:</label>
                <input type="text" id="title" name="event_title" required
                    value={eventTitle} 
                    onChange={(e) => {setSubmitMessage(""); setEventTitle(e.target.value)}}>
                </input>
                </div>

                <center>
                <DateSelector></DateSelector>
                </center>

                <div className='slider-area'>
                <div>
                    <div>{convertTimestamp(sliderLabels[0])} - {convertTimestamp(sliderLabels[1])}</div>
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
                    Use the slider to adjust the the viewable area's start and end times.
                </p>
                </div>

                <div className="form-group">
                <label htmlFor="password">Password to Event Link (optional):</label>
                <input type="password" id="password" name="event_password"
                    value={password} onChange={handlePassword}>
                </input>
                </div>

                {password != "" && 
                <div className="form-group">
                <label htmlFor="repeat_password">Repeat Password:</label>
                <input type="password" id="repeat_password"
                    value={password2}
                    onChange={(e) => {setSubmitMessage(""); setPassword2(e.target.value)}}>
                </input>
                </div>
                }

                {(password2 != "") && 
                (password2 == password ? 
                <p style={{color:'green'}}>Passwords match!</p> :
                <p style={{color:'red'}}>Passwords do not match.</p>)
                }

                {submitMessage != "" && <p style={{color:'red'}}>{submitMessage}</p>}
                
                <button onClick={submitForm} className="create-event-button">Submit</button>
            </div>
            </div>
        </div>
    )
}

export default Create