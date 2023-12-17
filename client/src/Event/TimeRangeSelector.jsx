import React, { useState } from 'react';

const TimeRangeSelector = ({ onTimeChange }) => {
  const timeOptions = generateTimeOptions();

  const [startTime, setStartTime] = useState('07:00 AM');
  const [endTime, setEndTime] = useState('07:00 PM');
  const [error, setError] = useState('');

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    onTimeChange(convertTo24Hour(newStartTime), convertTo24Hour(endTime)); // Pass the new start time and current end time to the parent
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    onTimeChange(convertTo24Hour(startTime), convertTo24Hour(newEndTime)); // Pass the current start time and new end time to the parent
  };

  // Convert 12-hour format with AM/PM to minutes since midnight for comparison
  const timeToMinutes = (time) => {
    const [hoursMinutes, period] = time.split(' ');
    let [hours, minutes] = hoursMinutes.split(':').map(Number);
    if (period === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };

  function convertTo24Hour(timeStr) {
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
  
    // Convert hours to 24-hour format
    if (hours === 12) {
      hours = modifier === 'AM' ? 0 : 12;
    } else if (modifier === 'PM') {
      hours += 12;
    }
  
    // Pad the hours and minutes with zeros if necessary
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
  
    // Return the time string in 24-hour format with seconds padded
    return `${hours}:${minutes}:00`;
  }

  // Handle the form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {
      setError('End time must be after start time.');
      return;
    }

    setError('');
    alert(`Time interval selected: ${startTime} - ${endTime}`);
  };

  // Generate the disabled time options based on the selected times
  const getDisabledStartTimeOptions = () => {
    const endMinutes = timeToMinutes(endTime);
    return timeOptions.filter((time) => timeToMinutes(time) >= endMinutes);
  };

  const getDisabledEndTimeOptions = () => {
    const startMinutes = timeToMinutes(startTime);
    return timeOptions.filter((time) => timeToMinutes(time) <= startMinutes);
  };

  const disabledStartTimeOptions = getDisabledStartTimeOptions();
  const disabledEndTimeOptions = getDisabledEndTimeOptions();

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: '25px', fontStyle: 'italic'}}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <label>
        Display times no earlier than:
        <select value={startTime} onChange={handleStartTimeChange} style={{margin: "0 7px 0 7px"}}>
          {timeOptions.map((time, index) => (
            <option key={index} value={time} disabled={disabledStartTimeOptions.includes(time)}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <label>
        and no later than:
        <select value={endTime} onChange={handleEndTimeChange} style={{margin: "0 7px 0 7px"}}>
          {timeOptions.map((time, index) => (
            <option key={index} value={time} disabled={disabledEndTimeOptions.includes(time)}>
              {time}
            </option>
          ))}
           <option value="24:00">24:00</option>
        </select>
      </label>
      {/* <button type="submit">Submit</button> */}
    </form>
  );
};

export default TimeRangeSelector;

// Helper function to generate time options with 30-minute intervals
function generateTimeOptions() {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = to12HourFormat(hour, minute);
      times.push(time);
    }
  }
  return times;
}

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function to12HourFormat(hour, minute) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12AM
  return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${suffix}`;
}
