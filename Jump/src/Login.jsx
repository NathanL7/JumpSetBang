import React, { useState } from 'react';
import { useAuth } from './authContext';
import { useNavigate } from 'react-router-dom';
import "./Login.css"

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for Register
  const [totalBudget, setTotalBudget] = useState(0); // Only for Register
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5050/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed. Please check your credentials.');
      }

      const employee = await response.json();
      console.log('Successful Login! Welcome ' + employee.name);

      login(employee);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5050/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, total_budget: totalBudget }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed. Please try again.');
      }

      setSuccessMessage('Registration successful! You can now log in.');
      setIsRegistering(false); // Switch to Login form
      setUsername('');
      setPassword('');
      setName('');
      setTotalBudget(0);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      {successMessage && <p className="text-success">{successMessage}</p>}
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit}>
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
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isRegistering && (
          <>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                placeholder="Enter Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalBudget">Total Budget</label>
              <input
                type="number"
                className="form-control"
                id="totalBudget"
                placeholder="Enter Initial Budget"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value))}
                required
              />
            </div>
          </>
        )}
        <button type="submit" className="btn btn-success btn-block">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
          setSuccessMessage('');
        }}
        className="btn btn-secondary btn-block mt-3"
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default Login;
