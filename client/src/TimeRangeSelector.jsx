import React, { useState } from 'react';

const TimeRangeSelector = () => {
  const timeOptions = generateTimeOptions();

  const [startTime, setStartTime] = useState(timeOptions[0]);
  const [endTime, setEndTime] = useState(timeOptions[timeOptions.length - 1]);
  const [error, setError] = useState('');

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
    // Handle the valid time range (e.g., sending it to a server or processing it further)
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
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <label>
        Start Time:
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
          {timeOptions.map((time, index) => (
            <option key={index} value={time} disabled={disabledStartTimeOptions.includes(time)}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <label>
        End Time:
        <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
          {timeOptions.map((time, index) => (
            <option key={index} value={time} disabled={disabledEndTimeOptions.includes(time)}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Submit</button>
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
