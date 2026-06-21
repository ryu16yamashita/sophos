import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import FolderPage from "./pages/FolderPage";
import CardStudyPage from "./pages/CardStudyPage";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/folder/:folderId" element={<PrivateRoute><FolderPage /></PrivateRoute>} />
      {/* filter param: all | starred | understood */}
      <Route path="/study/:folderId/:filter" element={<PrivateRoute><CardStudyPage /></PrivateRoute>} />
      <Route path="/study/:folderId" element={<PrivateRoute><CardStudyPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
