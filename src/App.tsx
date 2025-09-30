import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { SessionContextProvider, useSession } from "@/components/auth/SessionContextProvider";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";

// Layouts
import AdminLayout from "@/components/layouts/AdminLayout";
import StudentLayout from "@/components/layouts/StudentLayout";
import TutorLayout from "@/components/layouts/TutorLayout";
import HodLayout from "@/components/layouts/HodLayout";
import PrincipalLayout from "@/components/layouts/PrincipalLayout";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminStudentManagement from "@/pages/admin/StudentManagement";
import AdminBatchManagement from "@/pages/admin/BatchManagement";
import AdminManageFaculties from "@/pages/admin/ManageFaculties";
import AdminManageTutors from "@/pages/admin/ManageTutors";
import AdminDepartmentManagement from "@/pages/admin/DepartmentManagement";
import AdminTemplateManagement from "@/pages/admin/TemplateManagement";
import AdminProfile from "@/pages/admin/Profile";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentNewRequest from "@/pages/student/NewRequest";
import StudentMyRequests from "@/pages/student/MyRequests";
import StudentProfile from "@/pages/student/Profile";

// Tutor Pages
import TutorDashboard from "@/pages/tutor/Dashboard";
import TutorPendingRequests from "@/pages/tutor/PendingRequests";
import TutorRequestHistory from "@/pages/tutor/RequestHistory";
import TutorStudents from "@/pages/tutor/Students";
import TutorProfile from "@/pages/tutor/Profile";

// HOD Pages
import HodDashboard from "@/pages/hod/Dashboard";
import HodPendingRequests from "@/pages/hod/PendingRequests";
import HodRequestHistory from "@/pages/hod/RequestHistory";
import HodProfile from "@/pages/hod/Profile";

// Principal Pages
import PrincipalDashboard from "@/pages/principal/Dashboard";
import PrincipalPendingRequests from "@/pages/principal/PendingRequests";
import PrincipalRequestHistory from "@/pages/principal/RequestHistory";
import PrincipalDepartmentOverview from "@/pages/principal/DepartmentOverview";
import PrincipalProfile from "@/pages/principal/Profile";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { session, loading, profile } = useSession();

  if (loading) {
    // Still loading session or profile, show a loading indicator or null
    return null;
  }

  if (!session || !profile) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Authenticated but not authorized, redirect to a suitable page (e.g., home or unauthorized)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <SessionContextProvider>
          <AppRoutes />
        </SessionContextProvider>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
};

const AppRoutes = () => {
  const { session, loading, profile } = useSession();

  if (loading) {
    // You can render a global loading spinner here if needed
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <p className="text-lg text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<AuthPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="student-management" element={<AdminStudentManagement />} />
        <Route path="batch-management" element={<AdminBatchManagement />} />
        <Route path="manage-faculties" element={<AdminManageFaculties />} />
        <Route path="manage-tutors" element={<AdminManageTutors />} />
        <Route path="department-management" element={<AdminDepartmentManagement />} />
        <Route path="template-management" element={<AdminTemplateManagement />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="request" element={<StudentNewRequest />} />
        <Route path="my-requests" element={<StudentMyRequests />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Tutor Routes */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute allowedRoles={["tutor"]}>
            <TutorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TutorDashboard />} />
        <Route path="pending-requests" element={<TutorPendingRequests />} />
        <Route path="request-history" element={<TutorRequestHistory />} />
        <Route path="students" element={<TutorStudents />} />
        <Route path="profile" element={<TutorProfile />} />
      </Route>

      {/* HOD Routes */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={["hod"]}>
            <HodLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HodDashboard />} />
        <Route path="pending-requests" element={<HodPendingRequests />} />
        <Route path="request-history" element={<HodRequestHistory />} />
        <Route path="profile" element={<HodProfile />} />
      </Route>

      {/* Principal Routes */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute allowedRoles={["principal"]}>
            <PrincipalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PrincipalDashboard />} />
        <Route path="pending-requests" element={<PrincipalPendingRequests />} />
        <Route path="request-history" element={<PrincipalRequestHistory />} />
        <Route path="department-overview" element={<PrincipalDepartmentOverview />} />
        <Route path="profile" element={<PrincipalProfile />} />
      </Route>

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;