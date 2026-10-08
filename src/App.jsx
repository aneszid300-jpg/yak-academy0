import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Home from "./pages/dashboard/Home.jsx";
import Todos from "./pages/dashboard/Todos.jsx";
import Courses from "./pages/dashboard/Courses.jsx";
import CourseRedirect from "./pages/dashboard/CourseRedirect.jsx";
import Library from "./pages/dashboard/Library.jsx";
import Ai from "./pages/dashboard/Ai.jsx";
import Flash from "./pages/dashboard/Flash.jsx";
import PdfViewer from "./pages/dashboard/PdfViewer.jsx";
import Study from "./pages/dashboard/Study.jsx";
import Settings from "./pages/dashboard/Settings.jsx";
import PaymentReturn from "./pages/dashboard/PaymentReturn.jsx";
import MockGateway from "./pages/dashboard/MockGateway.jsx";
import Wallet from "./pages/dashboard/Wallet.jsx";
import Professor from "./pages/dashboard/Professor.jsx";
import Teachers from "./pages/dashboard/Teachers.jsx";
import Welcome from "./pages/dashboard/Welcome.jsx";
import Thanks from "./pages/dashboard/Thanks.jsx";
import AccessTest from "./pages/dashboard/AccessTest.jsx";
import ProfLayout from "./layouts/ProfLayout.jsx";
import ProfHome from "./pages/prof/ProfHome.jsx";
import ProfCourses from "./pages/prof/ProfCourses.jsx";
import ProfCourse from "./pages/prof/ProfCourse.jsx";
import ProfUpload from "./pages/prof/ProfUpload.jsx";
import ProfSessions from "./pages/prof/ProfSessions.jsx";
import ProfAnnouncements from "./pages/prof/ProfAnnouncements.jsx";
import ProfProfile from "./pages/prof/ProfProfile.jsx";
// The Live page (and its provider) is a separate chunk, fetched only when opened.
const Live = lazy(() => import("./pages/dashboard/Live.jsx"));
import { RequireCourseAccess, RequireDeckAccess, RequireExerciseAccess } from "./components/dashboard/payment/AccessGates.jsx";
import { isMockPayments } from "./services/paymentService.js";

// The old step-by-step checkout page (/dashboard/payment/course/:id) is
// retired: a unit is bought from its details window (useCourseCheckout). Old
// links land on the unit, whose gate offers that window.
function LegacyCheckoutRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/dashboard/study/${courseId}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      {/* دخول الأساتذة — the professors' own door */}
      <Route path="/prof/login" element={<Login variant="prof" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Every dashboard route requires an authenticated user. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="todos" element={<Todos />} />
          {/* ?view=my | ?view=exercises */}
          <Route path="courses" element={<Courses />} />
          {/* Legacy had no detail view: a course opens its study page. */}
          <Route path="courses/:courseId" element={<CourseRedirect />} />
          <Route path="library" element={<Library />} />
          {/* ?view=my (بطاقاتي) */}
          <Route path="ai" element={<Ai />} />
          <Route path="flash" element={<Flash />} />
          {/* Flashcards come with their unit: the unit's access decides. */}
          <Route path="flash/:deckId" element={<RequireDeckAccess><Flash /></RequireDeckAccess>} />
          <Route path="pdf" element={<PdfViewer />} />
          <Route path="pdf/:id" element={<RequireExerciseAccess><PdfViewer /></RequireExerciseAccess>} />
          {/* The study view always belongs to a course, and units are paid. */}
          <Route path="study" element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="study/:courseId" element={<RequireCourseAccess><Study /></RequireCourseAccess>} />
          <Route path="study/:courseId/:lessonId" element={<RequireCourseAccess><Study /></RequireCourseAccess>} />
          <Route path="settings" element={<Settings />} />
          {/* Payment: only units are sold, from the unit's details window. */}
          <Route path="payment" element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="payment/course/:courseId" element={<LegacyCheckoutRedirect />} />
          <Route path="payment/return/:purchaseId" element={<PaymentReturn />} />
          {isMockPayments && <Route path="payment/mock-gateway/:purchaseId" element={<MockGateway />} />}
          <Route path="wallet" element={<Wallet />} />
          <Route path="teachers" element={<Teachers />} />
          {/* بطاقة الترحيب — opens once on the first visit (DashboardLayout); again from الإعدادات */}
          <Route path="welcome" element={<Welcome />} />
          {/* رسالة الشكر — opens once when a course is bought (DashboardLayout); kept in الإعدادات */}
          <Route path="thanks" element={<Thanks />} />
          {/* منح الوصول (تجريبي) — TEMPORARY test page until the admin dashboard */}
          <Route path="access" element={<AccessTest />} />
          <Route path="professors/:professorId" element={<Professor />} />
          {/* الجلسة المباشرة (Home → «انضم الآن») */}
          <Route path="live/:sessionId" element={<Suspense fallback={null}><Live /></Suspense>} />
        </Route>
      </Route>

      {/* لوحة الأستاذ — its own space; only professor accounts (features/roles.js) */}
      <Route element={<ProtectedRoute loginPath="/prof/login" />}>
        <Route path="/prof" element={<ProfLayout />}>
          <Route index element={<ProfHome />} />
          <Route path="courses" element={<ProfCourses />} />
          <Route path="courses/:courseId" element={<ProfCourse />} />
          <Route path="upload" element={<ProfUpload />} />
          <Route path="schedule" element={<Navigate to="/prof/sessions" replace />} />
          <Route path="sessions" element={<ProfSessions />} />
          <Route path="announcements" element={<ProfAnnouncements />} />
          <Route path="live" element={<Navigate to="/prof/sessions" replace />} />
          <Route path="profile" element={<ProfProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
