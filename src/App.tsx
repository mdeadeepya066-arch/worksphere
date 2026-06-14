import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppDataProvider } from './contexts/AppContext';

// Layouts
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';

// Seeker Pages
import { SeekerDashboard } from './pages/SeekerDashboard';
import { JobSearch } from './pages/JobSearch';
import { SavedJobs } from './pages/SavedJobs';
import { SeekerApplications } from './pages/SeekerApplications';
import { SeekerProfilePage } from './pages/SeekerProfile';

// Employer Pages
import { EmployerDashboard } from './pages/EmployerDashboard';
import { ManageJobs } from './pages/ManageJobs';
import { CreateJob } from './pages/CreateJob';
import { ManageApplications } from './pages/ManageApplications';

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Seeker Routes */}
            <Route path="/seeker" element={<DashboardLayout requiredRole="seeker" />}>
               <Route index element={<Navigate to="/seeker/dashboard" replace />} />
               <Route path="dashboard" element={<SeekerDashboard />} />
               <Route path="jobs" element={<JobSearch />} />
               <Route path="saved" element={<SavedJobs />} />
               <Route path="applications" element={<SeekerApplications />} />
               <Route path="profile" element={<SeekerProfilePage />} />
            </Route>

            {/* Employer Routes */}
            <Route path="/employer" element={<DashboardLayout requiredRole="employer" />}>
               <Route index element={<Navigate to="/employer/dashboard" replace />} />
               <Route path="dashboard" element={<EmployerDashboard />} />
               <Route path="jobs" element={<ManageJobs />} />
               <Route path="jobs/create" element={<CreateJob />} />
               <Route path="applications" element={<ManageApplications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppDataProvider>
    </AuthProvider>
  );
}
