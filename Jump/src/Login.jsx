import React, { useState } from 'react';
import { useAuth } from './authContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import jwtDecode from 'jwt-decode'; // Fixed import for jwtDecode

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://project3-team3-rf8c.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const employee = await response.json();
      console.log("Successful Login! Welcome " + employee.firstName);
      
      login(employee);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLoginSuccess = (response) => {
    console.log("Google Login Success:", response);
    const user = jwtDecode(response.credential);
    const employeeData = {
      id: null,
      firstName: user.given_name,
      lastName: user.family_name,
      isManager: false,
    };
    
    login(employeeData);
    navigate('/home');
  };

  const handleGoogleLoginFailure = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          className="form-control"
          id="username"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          className="form-control"
          id="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-danger">{error}</p>}
      <button type="submit" className="btn btn-success btn-block">
        Login
      </button>
      <div className="mt-3">
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={handleGoogleLoginFailure}
        />
      </div>
    </form>
  );
};

export default Login;
