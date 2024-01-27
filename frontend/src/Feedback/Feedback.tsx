import "./feedback.css"
import { useState } from 'react';


interface FeedbackData {
    feedbackType: string;
    message: string;
};
  
const FeedbackForm = () => {
    const [feedbackData, setFeedbackData] = useState<FeedbackData>({ feedbackType: 'bug', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value });
    };
    
    const sendFeedback = (feedback: FeedbackData) => {
        
    }

    const handleSubmit = (e: React.FormEvent) => {
        if (feedbackData.message) {
        sendFeedback(feedbackData);
        setFeedbackData({ feedbackType: 'bug', message: '' });
        } else {
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
            <p>LimeCal is 100% open-source. If you're a developer 
                and would like to report bugs or any kind of problem in the codebase, I would highly appreciate it
                if you could create a post under <a href="https://github.com/michahn01/LimeCal/issues">Issues</a> in 
                LimeCal's GitHub repository so I can fix it right away!</p>
            <p>If you want to directly suggest changes to the codebase, please feel free to
                leave a <a href="https://github.com/michahn01/LimeCal/pulls">Pull Request</a>.
            </p>
        </div>
    </div>
  )
}

export default Feedback