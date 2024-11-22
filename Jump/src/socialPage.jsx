import React, { useState } from 'react';
import './socialPage.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

function MyCalendar() {
    const localizer = momentLocalizer(moment);
    const [eventsList, setEventsList] = useState([]);

    function handleSelect({ start, end }) {
        const title = window.prompt('New Event name');
        if (title) {
            const newEvent = {
                start: start,
                end: end,
                title: title,
            };
            // Create a new array to update state immutably
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
                onSelectSlot={handleSelect}
            />
        </div>
    );
}

function SocialPage() {
    return (
        <div className="social-page">
            <h1 className="page-title">Social Events</h1>
            <MyCalendar />
        </div>
    );
}

export default SocialPage;
