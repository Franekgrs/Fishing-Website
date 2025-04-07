// src/context/AuthContext.js
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    const storedEmail = localStorage.getItem('email')
    if (authToken && storedUsername && storedUserId && storedEmail) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
      setEmail(storedEmail);
    }
  }, []);

  const login = (username, token, userId, email) => {
    setIsLoggedIn(true);
    setUsername(username);
    setUserId(userId)
    setEmail(email)
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email)
    console.log('userId:', userId);
    console.log('Token:', token);

  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setUserId(null);
    setEmail(null)
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId')
    localStorage.removeItem('email')
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, userId, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
