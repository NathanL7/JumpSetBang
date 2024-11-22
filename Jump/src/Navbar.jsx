// src/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; 

function Navbar() {
  return (
<nav className="navbar">
  <div className="navbar-container">
    <h1 className="navbar-logo">YourDailyTracker</h1>
    <ul className="navbar-links">
      <li>
        <Link to="/" className="button-link">
          <button className="Nav-Buttons">User Page</button>
        </Link>
      </li>
      <li>
        <Link to="/calendar" className="button-link">
          <button className="Nav-Buttons">Social Page</button>
        </Link>
      </li>
      <li>
        <Link to="/Login" className="button-link">
          <button className="Nav-Buttons">Login</button>
        </Link>
      </li>
      <li>
        <Link to="/message" className="button-link">
          <button className="Nav-Buttons">Message</button>
        </Link>
      </li>
    </ul>
  </div>
</nav>
  ); 
}

export default Navbar;
