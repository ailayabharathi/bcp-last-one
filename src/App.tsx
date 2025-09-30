import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { SessionContextProvider, useSession } from "@/components/auth/SessionContextProvider";
import { ColorThemeProvider } from "@/components/shared/ColorThemeProvider"; // New import

import StudentLayout from "./components/layouts/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import NewRequest from "./pages/student/NewRequest";
import MyRequests from "./pages/student/MyRequests";
import StudentProfile from "./pages/student/Profile";

import TutorLayout from "./components/layouts/TutorLayout";
import TutorDashboard from "./pages/tutor/Dashboard";
import TutorProfile from "./pages/tutor/Profile";
import TutorRequestHistory from "./pages/tutor/RequestHistory";
import TutorPendingRequests from "./pages/tutor/PendingRequests";
import TutorStudents from "./pages/tutor/Students";

import HodLayout from "./components/layouts/HodLayout";
import HodDashboard from "./pages/hod/Dashboard";
import HodProfile from "./pages/hod/Profile";
import HodRequestHistory from "./pages/hod/RequestHistory";
import HodPendingRequests from "./pages/hod/PendingRequests";

import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import ManageFaculties from "./pages/admin/ManageFaculties";
import DepartmentManagement from "./pages/admin/DepartmentManagement";
import TemplateManagement from "./pages/admin/TemplateManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import BatchManagement from "./pages/admin/BatchManagement";
import ManageTutors from "./pages/admin/ManageTutors";

import PrincipalLayout from "./components/layouts/PrincipalLayout";
import PrincipalDashboard from "./pages/principal/Dashboard";
import PrincipalProfile from "./pages/principal/Profile";
import PrincipalRequestHistory from "./pages/principal/RequestHistory";
import PrincipalPendingRequests from "./pages/principal/PendingRequests";
import DepartmentOverview from "./pages/principal/DepartmentOverview";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

const queryClient = new QueryClient();

// ProtectedRoute component to check authentication and role
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { session, loading, profile } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center">Loading application...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    // If session exists but profile is not loaded, it might be a new user or a loading issue.
    // Redirect to login or a loading screen until profile is ready.
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect to a generic dashboard or unauthorized page if role doesn't match
    switch (profile.role) {
      case 'student': return <Navigate to="/student/dashboard" replace />;
      case 'tutor': return <Navigate to="/tutor/dashboard" replace />;
      case 'hod': return <Navigate to="/hod/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      case 'principal': return <Navigate to="/principal/dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ColorThemeProvider> {/* Wrap with ColorThemeProvider */}
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <SessionContextProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                  <Route element={<StudentLayout />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/request" element={<NewRequest />} />
                    <Route path="/student/my-requests" element={<MyRequests />} />
                    <Route path="/student/profile" element={<StudentProfile />} />
                  </Route>
                </Route>

                {/* Tutor Routes */}
                <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                  <Route element={<TutorLayout />}>
                    <Route path="/tutor/dashboard" element={<TutorDashboard />} />
                    <Route path="/tutor/pending-requests" element={<TutorPendingRequests />} />
                    <Route path="/tutor/request-history" element={<TutorRequestHistory />} />
                    <Route path="/tutor/students" element={<TutorStudents />} />
                    <Route path="/tutor/profile" element={<TutorProfile />} />
                  </Route>
                </Route>

                {/* HOD Routes */}
                <Route element={<ProtectedRoute allowedRoles={["hod"]} />}>
                  <Route element={<HodLayout />}>
                    <Route path="/hod/dashboard" element={<HodDashboard />} />
                    <Route path="/hod/pending-requests" element={<HodPendingRequests />} />
                    <Route path="/hod/request-history" element={<HodRequestHistory />} />
                    <Route path="/hod/profile" element={<HodProfile />} />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/manage-faculties" element={<ManageFaculties />} />
                    <Route path="/admin/manage-tutors" element={<ManageTutors />} />
                    <Route path="/admin/student-management" element={<StudentManagement />} />
                    <Route path="/admin/batch-management" element={<BatchManagement />} />
                    <Route path="/admin/department-management" element={<DepartmentManagement />} />
                    <Route path="/admin/template-management" element={<TemplateManagement />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                  </Route>
                </Route>

                {/* Principal Routes */}
                <Route element={<ProtectedRoute allowedRoles={["principal"]} />}>
                  <Route element={<PrincipalLayout />}>
                    <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
                    <Route path="/principal/pending-requests" element={<PrincipalPendingRequests />} />
                    <Route path="/principal/request-history" element={<PrincipalRequestHistory />} />
                    <Route path="/principal/department-overview" element={<DepartmentOverview />} />
                    <Route path="/principal/profile" element={<PrincipalProfile />} />
                  </Route>
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SessionContextProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ColorThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;