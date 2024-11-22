import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import EventCalendar from './EventCalendar';
import Landing from './Landing';
import Social from './Social';
import Login from './Login';
import Message from './Message';
import { AuthProvider } from './authContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/calendar" element={<EventCalendar />} />
          <Route path="/social" element={<Social />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/message" element={<Message />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
