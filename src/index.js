import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import LoginPage from './pages/LoginPage/LoginPage';
import HelpPage from './pages/HelpPage/HelpPage';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage';
import HomePage from './pages/HomePage/HomePage';
import SicPage from './pages/SicPage/SicPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/home' element={<HomePage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/help' element={<HelpPage />} />
        <Route path='/sic' element={<SicPage />} />
        <Route path='/about_us' element={<AboutUsPage />} />
      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
