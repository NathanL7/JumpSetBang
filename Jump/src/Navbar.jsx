import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import './Navbar.css';



function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login"); 
  };
  
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
            <Link to="/social" className="button-link">
              <button className="Nav-Buttons">Social Page</button>
            </Link>
          </li>
          <li className="nav-item dropdown">
            {user ? (
              <div className="dropdown">
                <button
                  className="Nav-Buttons dropdown-toggle"
                  onClick={toggleDropdown}
                >
                  {user.name}
                </button>
                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/login" className="button-link">
                <button className="Nav-Buttons">Login</button>
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
