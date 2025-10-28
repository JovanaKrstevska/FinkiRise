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
import CreateLabPage from './pages/CreateLabPage/CreateLabPage';
import { AuthProvider } from './contexts/AuthContext';
import { SubjectHistoryProvider } from './contexts/SubjectHistoryContext';
import ProtectedRoute from './components/ProtectedRoute';
import './utils/setupTestData'; // For development testing
import './utils/resetDatabase'; // For database reset
import TutorialPage from './pages/TutorialPage/TutorialPage';
import ExamPage from './pages/ExamPage/ExamPage';
import ExamDetailPage from './pages/ExamDetailPage/ExamDetailPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <SubjectHistoryProvider>
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
          <Route path='/tutorials' element={
            <ProtectedRoute>
              <TutorialPage />
            </ProtectedRoute>
          } />
          <Route path='/labs' element={
            <ProtectedRoute>
              <LabPage />
            </ProtectedRoute>
          } />
          <Route path='/exams' element={
            <ProtectedRoute>
              <ExamPage />
            </ProtectedRoute>
          } />
          <Route path='/labs/:labId' element={
            <ProtectedRoute>
              <DetailsPage />
            </ProtectedRoute>
          } />
          <Route path='/exams/:subjectId' element={
            <ProtectedRoute>
              <ExamDetailPage />
            </ProtectedRoute>
          } />
          <Route path='/professor/labs/create/:subjectId' element={
            <ProtectedRoute>
              <CreateLabPage />
            </ProtectedRoute>
          } />
          </Routes>
        </SubjectHistoryProvider>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
