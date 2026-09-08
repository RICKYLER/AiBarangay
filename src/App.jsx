import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Website
import PublicLayout from './layouts/PublicLayout';
import HomePage from './pages/public/HomePage';
import CommunityMapPage from './pages/public/CommunityMapPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutPage from './pages/public/AboutPage';
import HelpPage from './pages/public/HelpPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyAccountPage from './pages/VerifyAccountPage';

// Resident Portal
import ResidentLayout from './layouts/ResidentLayout';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import ResidentReportProblem from './pages/resident/ResidentReportProblem';
import ResidentMyReports from './pages/resident/ResidentMyReports';
import ResidentMap from './pages/resident/ResidentMap';
import ResidentNotifications from './pages/resident/ResidentNotifications';
import ResidentMessages from './pages/resident/ResidentMessages';
import ResidentProfile from './pages/resident/ResidentProfile';
import ResidentSettings from './pages/resident/ResidentSettings';
import ResidentHelpCenter from './pages/resident/ResidentHelpCenter';

// Barangay Operations Admin Portal
import BarangayLayout from './layouts/BarangayLayout';
import BarangayDashboard from './pages/admin/BarangayDashboard';
import BarangayReports from './pages/admin/BarangayReports';
import BarangayReviewReport from './pages/admin/BarangayReviewReport';
import BarangayIncidents from './pages/admin/BarangayIncidents';
import BarangayLiveMap from './pages/admin/BarangayLiveMap';
import BarangayAssignments from './pages/admin/BarangayAssignments';
import BarangayFieldOps from './pages/admin/BarangayFieldOps';
import BarangayAiIntel from './pages/admin/BarangayAiIntel';
import BarangayAnalytics from './pages/admin/BarangayAnalytics';
import BarangayUsers from './pages/admin/BarangayUsers';
import BarangayZones from './pages/admin/BarangayZones';
import BarangayCategories from './pages/admin/BarangayCategories';
import BarangaySettings from './pages/admin/BarangaySettings';
import BarangayAuditLogs from './pages/admin/BarangayAuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Website */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="community-map" element={<CommunityMapPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="/public" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />

        {/* 2. Resident Portal */}
        <Route path="/resident" element={<ResidentLayout />}>
          <Route index element={<Navigate to="/resident/dashboard" replace />} />
          <Route path="dashboard" element={<ResidentDashboard />} />
          <Route path="report" element={<ResidentReportProblem />} />
          <Route path="my-reports" element={<ResidentMyReports />} />
          <Route path="map" element={<ResidentMap />} />
          <Route path="notifications" element={<ResidentNotifications />} />
          <Route path="messages" element={<ResidentMessages />} />
          <Route path="profile" element={<ResidentProfile />} />
          <Route path="settings" element={<ResidentSettings />} />
          <Route path="help" element={<ResidentHelpCenter />} />
        </Route>

        {/* 3. Barangay Operations Admin Portal */}
        <Route path="/admin" element={<BarangayLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<BarangayDashboard />} />
          <Route path="reports" element={<BarangayReports />} />
          <Route path="reports/review/:id" element={<BarangayReviewReport />} />
          <Route path="incidents" element={<BarangayIncidents />} />
          <Route path="live-map" element={<BarangayLiveMap />} />
          <Route path="assignments" element={<BarangayAssignments />} />
          <Route path="field-ops" element={<BarangayFieldOps />} />
          <Route path="ai-intel" element={<BarangayAiIntel />} />
          <Route path="analytics" element={<BarangayAnalytics />} />
          <Route path="users" element={<BarangayUsers />} />
          <Route path="zones" element={<BarangayZones />} />
          <Route path="categories" element={<BarangayCategories />} />
          <Route path="audit-logs" element={<BarangayAuditLogs />} />
          <Route path="settings" element={<BarangaySettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
