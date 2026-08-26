/**
 * Consultant Availability Schedule
 */

import { useState } from 'react';
import '../styles/ConsultantAvailabilityPage.css';

function ConsultantAvailabilityPage() {
  const [availability, setAvailability] = useState({
    monday: { from: '09:00', to: '17:00', available: true },
    tuesday: { from: '09:00', to: '17:00', available: true },
    wednesday: { from: '09:00', to: '17:00', available: true },
    thursday: { from: '09:00', to: '17:00', available: true },
    friday: { from: '09:00', to: '17:00', available: true },
    saturday: { from: '10:00', to: '14:00', available: false },
    sunday: { from: '', to: '', available: false },
  });

  const handleChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  return (
    <>
        <div className="consultant-header">
          <h1>Set Availability</h1>
          <p>Choose when you are available for calls and chats</p>
        </div>

        <div className="availability-container">
          {Object.entries(availability).map(([day, schedule]) => (
            <div key={day} className="availability-row">
              <label className="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>

              <div className="availability-inputs">
                <input
                  type="checkbox"
                  checked={schedule.available}
                  onChange={(e) => handleChange(day, 'available', e.target.checked)}
                />

                {schedule.available && (
                  <>
                    <input
                      type="time"
                      value={schedule.from}
                      onChange={(e) => handleChange(day, 'from', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={schedule.to}
                      onChange={(e) => handleChange(day, 'to', e.target.value)}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ marginTop: '20px' }}>
          Save Availability
        </button>
    </>
  );
}

export default ConsultantAvailabilityPage;
