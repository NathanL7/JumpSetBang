import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { useAuth } from './authContext';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: null,
    end: null,
    location: '',
    cost: '',
  });
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Fetch events for the user
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5050/users/${user.username}/events`);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const eventsData = await response.json();
        // Convert events to required format for Calendar
        const formattedEvents = eventsData.map((event) => ({
          title: event.title || 'Unnamed Event',
          start: new Date(event.time_begin),
          end: new Date(event.time_end),
          location: event.location,
          cost: event.cost,
          id: event.event_id,
        }));
        setEvents(formattedEvents);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEvents();
  }, [user.username]);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      title: '',
      start,
      end,
      location: '',
      cost: '',
    });
    setShowForm(true);
  };

  const handleEventDrop = ({ event, start, end }) => {
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id ? { ...existingEvent, start, end } : existingEvent
    );
    setEvents(updatedEvents);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        title: newEvent.title,
        time_begin: newEvent.start.toISOString(),
        time_end: newEvent.end.toISOString(),
        location: newEvent.location,
        cost: parseFloat(newEvent.cost),
        username: user.username,
      };

      const response = await fetch('http://127.0.0.1:5050/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create event.');
      }

      const { event_id } = await response.json();
      const createdEvent = { ...eventData, id: event_id, start: newEvent.start, end: newEvent.end };
      setEvents((prev) => [...prev, createdEvent]);
      setShowForm(false);
      setNewEvent({
        title: '',
        start: null,
        end: null,
        location: '',
        cost: '',
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Event Calendar</h2>
      {error && <p className="text-danger">{error}</p>}
      <DnDCalendar
        defaultDate={new Date()}
        defaultView="week"
        events={events}
        localizer={localizer}
        onEventDrop={handleEventDrop}
        onSelectSlot={handleSelectSlot}
        selectable
        style={{ height: '80vh' }}
      />

      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newEvent.location}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="cost"
              placeholder="Cost"
              value={newEvent.cost}
              onChange={handleInputChange}
              required
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit">Add Event</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;
