import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import Layout from './components/Layout';

const PrivateRoute = ({ element: Element }) => {
  return localStorage.getItem('token') ? (
    <Element />
  ) : (
    <Navigate to="/login" />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/admin-dashboard" element={<PrivateRoute element={AdminDashboard} />} />
          <Route path="/student-dashboard" element={<PrivateRoute element={StudentDashboard} />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;