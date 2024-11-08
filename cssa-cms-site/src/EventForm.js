import React, { useState } from 'react';
import axios from 'axios';

const EventForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',  // Store date as a string initially
    time: '',  // Store time as a string initially
    location: '',
    poster: null,
    language: 'English',  // Default language selection
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      poster: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Combine date and time into a single Date object
    const combinedDateTime = new Date(`${formData.date}T${formData.time}`);
    console.log(combinedDateTime);

    // Create FormData to send file and other event details
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('date', combinedDateTime);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('poster', formData.poster);
    formDataToSend.append('language', formData.language);  // Add language to form data
    formDataToSend.append('description', formData.description);

    try {
      const response = await axios.post('https://cms-vz9f.onrender.com/events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Event created:', response.data);
    } catch (error) {
      console.error('Error posting event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Event Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Time:</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Location:</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Poster Image:</label>
        <input
          type="file"
          name="poster"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
      </div>
      <div>
        <label>Language:</label>
        <select name="language" value={formData.language} onChange={handleChange} required>
          <option value="English">English</option>
          <option value="French">French</option>
        </select>
      </div>
      <div>
        <label>Description :</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Create Event</button>
    </form>
  );
};

export default EventForm;
