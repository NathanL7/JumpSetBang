// src/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Or use a dedicated Navbar.css if needed

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">MyApp</h1>
        <ul className="navbar-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/calendar">Event Calendar</Link>
          </li>
          <li>
            <Link to="/social">Social Page</Link>
          </li>
          <li>
            <Link to="/login" className="navbar-login-button">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
