import "./Home.css"
import "./lines_background.css"
import "./square_background.css"
import { Link } from 'react-router-dom'

const Home = () => {
    // display has been set to "none" here to avoid "Flash of Unstyled Content" (FOUC),
    // where components load before CSS and thus are unstyled for a split second.
    // The CSS for this component will override "display: none" with "display: flex"
    // when the CSS arrives, so this component will not be seen until the CSS is ready.
  return (
    <div id='page_body' style={{display: "none"}}>
        <div className="relative_background">
            <div className='portable-container'>
                <div className="lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
            </div>
            <div className="text_region">
                <div className="text-box" id="against_line_background">
                    Always pick the optimal time for a meeting.
                    <p>Share a digital calendar with people you want to meet.
                        Each person marks their available times on the calendar.
                        We'll show you all overlapping slots.
                    </p>
                </div>
            </div>
        </div>

        <div className="gradient_background wrapper">
            <ul className="circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
            <div className="text_region">
                <div className="text-box">
                    <ul className="checkmarks-list">
                        <li>100% free and open source.</li>
                        <li>Share calendars via links.</li>
                        <li>Supports meets of any size.</li>
                    </ul>
                    <Link id="big-create-button" to="/events/create">Create an event</Link>
                </div>
            </div>
        </div>


    </div>
  )
}

export default Home