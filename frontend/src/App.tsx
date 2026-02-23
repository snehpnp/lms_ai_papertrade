import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StudentLayout from "@/components/layout/StudentLayout";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/Dashboard";
import UsersPage from "@/pages/admin/UsersPage";
import UserForm from "@/pages/admin/UserForm";
import SubadminsPage from "@/pages/admin/SubadminsPage";
import SubadminForm from "@/pages/admin/SubadminForm";
import CoursesPage from "@/pages/admin/CoursesPage";
import CourseForm from "@/pages/admin/CourseForm";
import LessonsPage from "@/pages/admin/LessonsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import StudentDashboard from "@/pages/student/Dashboard";
import StudentCourses from "@/pages/student/Courses";
import CourseDetail from "@/pages/student/CourseDetail";
import StudentProfile from "@/pages/student/Profile";
import PaperTrade from "@/pages/student/PaperTrade";
import {
  AdminLessons,
  AdminQuiz,
  AdminProfile,
  SubadminDashboard,
  SubadminUsers,
  SubadminCourses,
  SubadminLessons,
  SubadminQuiz,
  SubadminTradeAnalytics,
  SubadminProfile,
} from "@/pages/PlaceholderPages";
import NotFound from "./pages/NotFound";
import LessonForm from "./pages/admin/LessonForm";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}/dashboard`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/add" element={<UserForm />} />
              <Route path="users/edit/:id" element={<UserForm />} />
              <Route path="subadmins" element={<SubadminsPage />} />
              <Route path="subadmins/add" element={<SubadminForm />} />
              <Route path="subadmins/edit/:id" element={<SubadminForm />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="courses/add" element={<CourseForm />} />
              <Route path="courses/edit/:id" element={<CourseForm />} />
              <Route path="lessons" element={<LessonsPage />} />
              <Route path="lessons/add" element={<LessonForm />} />
              <Route path="lessons/edit/:id" element={<LessonForm />} />

              <Route path="quiz" element={<AdminQuiz />} />
              <Route path="trade-analytics" element={<AnalyticsPage />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* SubAdmin Routes */}
            <Route
              path="/subadmin"
              element={
                <ProtectedRoute allowedRoles={["subadmin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SubadminDashboard />} />
              <Route path="users" element={<SubadminUsers />} />
              <Route path="courses" element={<SubadminCourses />} />
              <Route path="lessons" element={<SubadminLessons />} />
              <Route path="quiz" element={<SubadminQuiz />} />
              <Route path="trade-analytics" element={<SubadminTradeAnalytics />} />
              <Route path="profile" element={<SubadminProfile />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                // <ProtectedRoute allowedRoles={["student"]}>
                <ProtectedRoute allowedRoles={["user"]}>

                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="paper-trade" element={<PaperTrade />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
