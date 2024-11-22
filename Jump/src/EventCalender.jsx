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
    cost: '',
    startTime: '',
    endTime: ''
  });

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({
      title: '',
      start,
      end,
      location: '',
      cost: '',
      startTime: moment(start).format('HH:mm'),
      endTime: moment(end).format('HH:mm')
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
    
    // Combine date and time for start
    const startDateTime = moment(newEvent.start)
      .hour(parseInt(newEvent.startTime.split(':')[0]))
      .minute(parseInt(newEvent.startTime.split(':')[1]))
      .toDate();

    // Combine date and time for end
    const endDateTime = moment(newEvent.end)
      .hour(parseInt(newEvent.endTime.split(':')[0]))
      .minute(parseInt(newEvent.endTime.split(':')[1]))
      .toDate();

    const eventToAdd = {
      title: newEvent.title,
      start: startDateTime,
      end: endDateTime,
      location: newEvent.location,
      cost: newEvent.cost
    };

    setEvents(prev => [...prev, eventToAdd]);
    setShowForm(false);
    setNewEvent({
      title: '',
      start: null,
      end: null,
      location: '',
      cost: '',
      startTime: '',
      endTime: ''
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
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Start Time:</label>
                <input
                  type="time"
                  name="startTime"
                  value={newEvent.startTime}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>End Time:</label>
                <input
                  type="time"
                  name="endTime"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newEvent.location}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            
            <input
              type="number"
              name="cost"
              placeholder="Cost"
              value={newEvent.cost}
              onChange={handleInputChange}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
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