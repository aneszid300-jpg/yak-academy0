import { Navigate, Route, Routes } from "react-router-dom";

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
import Payment from "./pages/dashboard/Payment.jsx";
import PaymentReturn from "./pages/dashboard/PaymentReturn.jsx";
import MockGateway from "./pages/dashboard/MockGateway.jsx";
import Wallet from "./pages/dashboard/Wallet.jsx";
import { RequireCourseAccess, RequireDeckAccess } from "./components/dashboard/payment/AccessGates.jsx";
import { isMockPayments } from "./services/paymentService.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
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
          <Route path="pdf/:id" element={<PdfViewer />} />
          {/* The study view always belongs to a course, and units are paid. */}
          <Route path="study" element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="study/:courseId" element={<RequireCourseAccess><Study /></RequireCourseAccess>} />
          <Route path="study/:courseId/:lessonId" element={<RequireCourseAccess><Study /></RequireCourseAccess>} />
          <Route path="settings" element={<Settings />} />
          {/* Payment: only units are sold. */}
          <Route path="payment" element={<Navigate to="/dashboard/courses" replace />} />
          <Route path="payment/course/:courseId" element={<Payment />} />
          <Route path="payment/return/:purchaseId" element={<PaymentReturn />} />
          {isMockPayments && <Route path="payment/mock-gateway/:purchaseId" element={<MockGateway />} />}
          <Route path="wallet" element={<Wallet />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
