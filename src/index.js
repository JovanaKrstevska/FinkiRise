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
import LabPage from './pages/LabPage/LabPage';
import DetailsPage from './pages/DetailsPage/DetailsPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './utils/setupTestData'; // For development testing
import './utils/resetDatabase'; // For database reset

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/home' element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path='/help' element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          } />
          <Route path='/sic' element={
            <ProtectedRoute>
              <SicPage />
            </ProtectedRoute>
          } />
          <Route path='/about_us' element={
            <ProtectedRoute>
              <AboutUsPage />
            </ProtectedRoute>
          } />
          <Route path='/lab' element={
            <ProtectedRoute>
              <LabPage />
            </ProtectedRoute>
          } />
          <Route path='/lab/:subjectId' element={
            <ProtectedRoute>
              <DetailsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
