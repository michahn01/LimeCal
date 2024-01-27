import './help.css'; // Make sure to name your CSS file accordingly
import SpecificDates from "../assets/choose_specific_dates.png"
import DaysOfWeek from "../assets/choose_days_of_week.png"
import TimeRangeImg from "../assets/pick_time_range.png"
import EnterAvailability from "../assets/enter_availability.png"
import EnterName from "../assets/enter_name.png"
import FillAvailability from "../assets/fill_out_availability.png"
import SeeOverlaps from "../assets/see_overlaps.png"

const Help = () => {
  return (
    <div className="help-page">
      <div className='help-page-content'>
        <h1>Help</h1>
        <p>Have you used when2meet? This site is a lot like when2meet, 
          but with a nicer UI and better compatibility on mobile screens.</p>
        <br></br>
        <h2>Create Event</h2>
        <p>If you're planning an event or meeting, start by creating an event.</p>

        <div>
        <p>You can select specific dates that might work for your event:</p>
        <img src={SpecificDates} alt="Specific Dates" className="help-image"></img>
        <p>Or days of the week instead:</p>
        <img src={DaysOfWeek} alt="Days of the Week" className='help-image'></img>
        </div>

        <p>Then, pick a range of times that might work. Users you 
          invite will fill in their available times within this range.</p>
        <img src={TimeRangeImg} alt="Pick time range" className='help-image'></img>

        <p>Once you've created your event, you can have other people fill out their
          available times by sharing the URL of your event.
        </p>
        <br></br>
        <h2>Responding to an Event</h2>
        <p>To fill out your available time slots, start by 
          pressing the "enter availability" button.</p>
        <img src={EnterAvailability} alt="Enter availability" className='help-image'></img>

        <p>You'll be asked to enter your name. If 
          you had already filled in your time slots for this event
          and would like to edit your times, enter the same name 
          as before to sign back in.</p>
        <img src={EnterName} alt="Enter name" className='help-image'></img>
        <p>Then, fill in your available times by clicking and dragging over
          the time-slots grid.
        </p>
        <img src={FillAvailability} alt="Fill availabiilty" className='help-image-big'></img>
        <p>When you're done filling in your availabiilty, you can hover over any slot in the time-slots grid
          to see who's available at that time slot and who's not.
        </p>
        <img src={SeeOverlaps} alt="See overlaps" className='help-image-big'></img>
      </div>
    </div>
  );
};

export default Help;
