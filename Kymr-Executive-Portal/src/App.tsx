import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { GoogleProvider } from './contexts/GoogleContext';
import { EmailProvider } from './contexts/EmailContext';

// Layouts
import { AppShell } from './components/layout/AppShell';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InquiriesList from './pages/InquiriesList';
import InquiryDetail from './pages/InquiryDetail';
import Pipeline from './pages/Pipeline';
import ClientsList from './pages/ClientsList';
import ClientDetail from './pages/ClientDetail';
import { Inbox } from './pages/Inbox';
import { Files } from './pages/Files';
import { Integrations } from './pages/Integrations';
import ComingSoon from './pages/ComingSoon';
import Meetings from './pages/Meetings';
import Quotes from './pages/Quotes';
import Projects from './pages/Projects';
import Invoices from './pages/Invoices';
import { SettingsServices } from './pages/SettingsServices';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthorized } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-brand-black text-brand-ivory font-mono text-xs uppercase tracking-widest">
        Initializing Command Center...
      </div>
    );
  }

  if (!user || isAuthorized === false) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <GoogleProvider>
      <AuthProvider>
        <EmailProvider>
          <BrowserRouter>
            <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          <Route path="/admin/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* INQUIRIES */}
            <Route path="inquiries" element={<InquiriesList />} />
            <Route path="inquiries/:id" element={<InquiryDetail />} />
            
            {/* PIPELINE */}
            <Route path="pipeline" element={<Pipeline />} />
            
            {/* CLIENTS */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            
            {/* INBOX & FILES (WORKSPACE) */}
            <Route path="inbox" element={<Inbox />} />
            <Route path="files" element={<Files />} />

            {/* FOUNDATIONS / COMING SOON */}
            <Route path="meetings" element={<Meetings />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<ComingSoon title="Tasks" />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="activity" element={<ComingSoon title="Activity Stream" />} />
            
            {/* SETTINGS */}
            <Route path="settings" element={<ComingSoon title="Settings" />} />
            <Route path="settings/services" element={<SettingsServices />} />
            <Route path="settings/integrations" element={<Integrations />} />
          </Route>
            </Routes>
          </BrowserRouter>
        </EmailProvider>
      </AuthProvider>
    </GoogleProvider>
  );
}
