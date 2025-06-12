import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin: (token: string, user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password,
      });
      const { token, user } = response.data;
      onLogin(token, user);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <form data-testid="login_form" onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          data-testid="login_form_username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Password</label>
        <input
          data-testid="login_form_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button data-testid="login_form_login" type="submit">Login</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default LoginForm; 