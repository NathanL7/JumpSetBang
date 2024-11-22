// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import EventCalendar from './EventCalendar';
import Landing from './Landing';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/calendar" element={<EventCalendar />} />
      </Routes>
    </Router>
  );
}

export default App;
