import React from 'react'
import Calendar from "./Calendar.jsx"
import { useState } from "react"
import "./css/Create.css"

const Create = () => {
    const [eventTitle, setEventTitle] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [submitMessage, setSubmitMessage] = useState("");

    const sendApiRequest = () => {

    }

    const submitForm = (e) => {
        if (eventTitle.trimEnd() == "") {
            setSubmitMessage("Event title is required.")
            return;
        }
        if (password != "" && password != password2) {
            return;
        }
        sendApiRequest();
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setSubmitMessage("");
        if (e.target.value == "") {
            setPassword2("");
        }
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
                
                <button onClick={submitForm}>Submit</button>
            </div>
            </div>
        </div>
    )
}

export default Create