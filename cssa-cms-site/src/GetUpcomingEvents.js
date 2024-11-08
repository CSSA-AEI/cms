import React, { useState } from 'react';
import axios from 'axios';

const TestEventsButton = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const handleFetchEvents = async () => {
    try {
      const response = await axios.get('https://cms-vz9f.onrender.com/events');
      console.log(response.data)
      setEvents(response.data); // Set the events state with fetched data
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again.');
    }
  };

  return (
    <div>
      <button onClick={handleFetchEvents}>Fetch Upcoming Events</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {events.length > 0 && (
        <ul className='events-list'>
          {events.map((event) => (
            <li key={event._id}>
              <strong>{event.name}</strong><br />
              Date: {new Date(event.date).toLocaleDateString()}<br />
              Time: {new Date(event.date).toLocaleTimeString()}<br />
              Location: {event.location}<br />
              <img src={event.posterUrl} alt={event.name} style={{ width: '100px', height: 'auto' }} />
              <div>
                {event.description}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestEventsButton;
