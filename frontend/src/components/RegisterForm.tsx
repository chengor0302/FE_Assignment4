import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:3001/users', {
        name,
        email,
        username,
        password,
      });
      setSuccess('User created successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to create user');
    }
  };

  return (
    <form data-testid="create_user_form" onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          data-testid="create_user_form_name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label>Email</label>
        <input
          data-testid="create_user_form_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Username</label>
        <input
          data-testid="create_user_form_username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Password</label>
        <input
          data-testid="create_user_form_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button data-testid="create_user_form_create_user" type="submit">Create User</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </form>
  );
};

export default RegisterForm; 