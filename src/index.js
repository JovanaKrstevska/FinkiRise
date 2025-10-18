import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import LoginPage from './pages/LoginPage/LoginPage';
import HelpPage from './pages/HelpPage/HelpPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AboutUsPage from './pages/AboutUsPage/AboutUsPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>
        <Route path='/login' element={<LoginPage />}/>
        <Route path='/help' element={<HelpPage />}/>
        <Route path='/about_us' element={<AboutUsPage />}/>
      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
