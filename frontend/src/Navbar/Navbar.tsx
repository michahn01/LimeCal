import "./navbar.css"
import gitHubLogo from "../assets/github-mark-white.png"
import limecal_logo from "../assets/limecal_logo.png"

import { NavLink } from 'react-router-dom'

const Navbar = () => {
    // display has been set to "none" here to avoid "Flash of Unstyled Content" (FOUC),
    // where components load before CSS and thus are unstyled for a split second.
    // The CSS for this component will override "display: none" with "display: flex"
    // when the CSS arrives, so this component will not be seen until the CSS is ready.
    return (
        <div className="navbar" style={{display: "none"}}>
            <div className="navbar_subsection">
                <NavLink className="horizontal_container" to="/">
                    <img id="limecal_logo" src={limecal_logo} alt="homepage link logo"></img>
                    <p id="logo_text">LimeCal</p>
                </NavLink>
            </div>
            <ul className='navbar_subsection'>
                <li id="page_nav_section" className="horizontal_container">
                    <NavLink to="/events/create"
                    className={(n) => (n.isActive ? "link active_link" : 'link')}>
                    Create Event</NavLink>
                    <NavLink to="/help"
                    className={(n) => (n.isActive ? "link active_link" : 'link')}>
                    Help</NavLink>
                    <NavLink to="/feedback"
                    className={(n) => (n.isActive ? "link active_link" : 'link')}>
                    Feedback</NavLink>
                </li>
                <li className="horizontal_container" id="github-section">
                    <a href="https://github.com/michahn01/LimeCal" id="version_text">v0.1.0</a>
                    <a href="https://github.com/michahn01/LimeCal">
                        <img id="gitHubLink" src={gitHubLogo} alt="github link"></img>
                    </a>
                </li>
            </ul>
        </div>
    )
}

export default Navbar