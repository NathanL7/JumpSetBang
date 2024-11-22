import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

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
    cost: ''
  });

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      title: '',
      start,
      end,
      location: '',
      cost: ''
    });
    setShowForm(true);
  };

  const handleEventDrop = ({ event, start, end }) => {
    const updatedEvents = events.map(existingEvent =>
      existingEvent === event ? { ...existingEvent, start, end } : existingEvent
    );
    setEvents(updatedEvents);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEvents(prev => [...prev, newEvent]);
    setShowForm(false);
    setNewEvent({
      title: '',
      start: null,
      end: null,
      location: '',
      cost: ''
    });
  };

  return (
    <div style={{ padding: '20px' }}>
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
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
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
              <button type="submit">
                Add Event
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default EventCalendar;