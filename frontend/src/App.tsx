import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
import ExerciseHistoryPage from "@/pages/student/ExerciseHistoryPage";
import PaperTrade from "@/pages/student/PaperTrade";
import PaperTradeLearning from "@/pages/student/PaperTradeLearning";
import TradeDashboard from "@/pages/student/papertrade/TradeDashboard";
import WatchlistPage from "@/pages/student/papertrade/WatchlistPage";
import TradePlacementPage from "@/pages/student/papertrade/TradePlacementPage";
import PositionsPage from "@/pages/student/papertrade/PositionsPage";
import OrdersPage from "@/pages/student/papertrade/OrdersPage";
import TradeHistoryPage from "@/pages/student/papertrade/TradeHistoryPage";
import WalletPage from "@/pages/student/papertrade/WalletPage";
import Payment from "@/pages/student/Payment";
import AdminPaymentsPage from "@/pages/admin/PaymentsPage";
import StudentTransactionsPage from "@/pages/student/TransactionsPage";
import {
  SubadminDashboard,
  SubadminTradeAnalytics,
} from "@/pages/PlaceholderPages";
import NotFound from "./pages/NotFound";
import LessonForm from "./pages/admin/LessonForm";
import QuizzesPage from "./pages/admin/QuizzesPage";
import QuizForm from "./pages/admin/QuizForm";
import AdminSettings from "./pages/admin/SettingsPage";
import SharedProfile from "./pages/shared/ProfilePage";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={`/${user?.role}/dashboard`} replace />;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
            <AuthProvider>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
                <Route path="/forgot-password" element={<LoginPage />} />

                {/* ... rest of the routes ... */}
                <Route path="/admin"
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

                  <Route path="quizzes" element={<QuizzesPage />} />
                  <Route path="quizzes/new" element={<QuizForm />} />
                  <Route path="quizzes/edit/:id" element={<QuizForm />} />

                  <Route path="trade-analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="profile" element={<SharedProfile />} />
                </Route>

                <Route path="/subadmin"
                  element={
                    <ProtectedRoute allowedRoles={["subadmin"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<SubadminDashboard />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="users/add" element={<UserForm />} />
                  <Route path="users/edit/:id" element={<UserForm />} />
                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="courses/add" element={<CourseForm />} />
                  <Route path="courses/edit/:id" element={<CourseForm />} />
                  <Route path="lessons" element={<LessonsPage />} />
                  <Route path="lessons/add" element={<LessonForm />} />
                  <Route path="lessons/edit/:id" element={<LessonForm />} />
                  <Route path="quizzes" element={<QuizzesPage />} />
                  <Route path="quizzes/new" element={<QuizForm />} />
                  <Route path="quizzes/edit/:id" element={<QuizForm />} />
                  <Route path="trade-analytics" element={<SubadminTradeAnalytics />} />
                  <Route path="payments" element={<AdminPaymentsPage />} />
                  <Route path="profile" element={<SharedProfile />} />
                </Route>

                <Route path="/user"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentCourses />} />
                  <Route path="course/:id" element={<CourseDetail />} />
                  <Route path="exercises" element={<ExerciseHistoryPage />} />
                  <Route path="payment/:courseId" element={<Payment />} />
                  <Route path="paper-trade" element={<PaperTrade />} />
                  <Route path="paper-trade/dashboard" element={<TradeDashboard />} />
                  <Route path="paper-trade/watchlist" element={<WatchlistPage />} />
                  <Route path="paper-trade/trade" element={<TradePlacementPage />} />
                  <Route path="paper-trade/positions" element={<PositionsPage />} />
                  <Route path="paper-trade/orders" element={<OrdersPage />} />
                  <Route path="paper-trade/history" element={<TradeHistoryPage />} />
                  <Route path="paper-trade/wallet" element={<WalletPage />} />
                  <Route path="paper-trade/learning" element={<PaperTradeLearning />} />
                  <Route path="transactions" element={<StudentTransactionsPage />} />
                  <Route path="profile" element={<SharedProfile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </GoogleOAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
