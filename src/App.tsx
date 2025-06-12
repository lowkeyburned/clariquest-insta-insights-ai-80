import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import SurveyResultsPage from './pages/SurveyResults';
import BusinessSettings from './pages/BusinessSettings';
import CampaignManager from './pages/CampaignManager';
import { QueryClient } from 'react-query';
import Debug from "./pages/Debug";

function App() {
  return (
    <AuthProvider>
      <QueryClient>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/survey/:id" element={<Survey />} />
            <Route path="/survey/results/:id" element={<SurveyResultsPage />} />
            <Route path="/business/settings" element={<BusinessSettings />} />
            <Route path="/campaigns" element={<CampaignManager />} />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </BrowserRouter>
      </QueryClient>
    </AuthProvider>
  );
}

export default App;
