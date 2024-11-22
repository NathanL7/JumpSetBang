import React, { useState  } from 'react';
import './App.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'

function MyCalendar() {
    const localizer = momentLocalizer(moment)
    const [eventsList, setEventsList] = useState([]);

    function handleSelect({ start, end }) {
        const title = window.prompt("New Event name");
        if (title) {
          var newEvent = {
            start: start,
            end: end,
            title: title
          };
          setEventsList([...eventsList, newEvent]);
        }
      }

    return (
        <div>
        <Calendar
        selectable
        defaultView="week"
        defaultDate={new Date()}
        localizer={localizer}
        events={eventsList}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelect}
        />
        </div>
    )
}

function App() {
    return (
        <div>
        <MyCalendar />
        </div>
    );
}

export default App;
