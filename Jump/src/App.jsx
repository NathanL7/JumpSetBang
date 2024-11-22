// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import EventCalendar from './EventCalendar';
import Landing from './Landing';
import Login from './Login';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/calendar" element={<EventCalendar />} />
      <Route path="/login" element={<Login />} /> 
    </Routes>
  );
}

export default App;
