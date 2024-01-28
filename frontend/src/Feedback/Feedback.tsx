import "./feedback.css"
import { useState } from 'react';
import axiosConfig from "../axios.ts";


interface FeedbackData {
    feedbackType: string;
    message: string;
};
  
const FeedbackForm = () => {
    const [feedbackData, setFeedbackData] = useState<FeedbackData>({ feedbackType: 'bug', message: '' });
    const [statusMessage, setStatusMessage] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
    };
    
    const sendFeedbackToApi = (feedback: FeedbackData) => {
        setStatusMessage("Sending...");
        axiosConfig.post('/sendFeedback', {
            "feedbackType": feedback.feedbackType,
            "feedbackMessage": feedback.message
        })
        .then(() => {
            setStatusMessage("Successfully sent feedback! We really appreciate it!");
            setFeedbackData({ feedbackType: feedbackData.feedbackType, message: '' });
        })
        .catch(() => {
            setStatusMessage("Something went wrong. Please try again.")
        });
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (feedbackData.message) {
        sendFeedbackToApi(feedbackData);
        } 
        else {
        alert('Please fill out all fields.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="feedback-form">
        <div>
            <label htmlFor="feedbackType">Feedback Type:</label>
            <select id="feedbackType" name="feedbackType" value={feedbackData.feedbackType} onChange={handleChange}>
            <option value="bug">Bug Report</option>
            <option value="change">Suggest a Change</option>
            <option value="other">Other</option>
            </select>
        </div>
        <div>
            <label htmlFor="message">Message:</label>
            <textarea id="message" name="message" value={feedbackData.message} onChange={handleChange} />
        </div>
        <button type="submit">Submit Feedback</button>
        {
            (statusMessage !== "") ? <p style={{marginTop: "30px", marginBottom: "0px"}}>{statusMessage}</p> : null
        }
        </form>
    );
};

const Feedback = () => {
  return (
    <div className='feedback-page'>
        <div className="feedback-page-content">
            <h1>Give Feedback</h1>
            <p>Found bugs? Suggestions for the site? Any comments/concerns? Please give feedback!</p>
            <h2>Anonymous Feedback Form</h2>
            <FeedbackForm></FeedbackForm>

            <h2>For Developers</h2>
            <p>LimeCal is 100% open-source. If you're a developer and have identified problems 
                in the codebase, I would greatly appreciate it
                if you could create a post under <a href="https://github.com/michahn01/LimeCal/issues">Issues</a> in 
                LimeCal's GitHub repository so I can fix it right away!</p>
            <p>If you want to directly suggest changes to the source code, please feel free to
                leave a <a href="https://github.com/michahn01/LimeCal/pulls">Pull Request</a>.
            </p>
        </div>
    </div>
  )
}

export default Feedback