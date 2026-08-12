import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import {
  INITIAL_ASSESSMENT_ROUTE,
  InitialAssessmentRouteElement,
} from "./routes/assessment.routes";

import {
  ASSESSMENT_2_ROUTE,
} from "./routes/assessment2.routes";

import "./i18n";
import DiagnosticResultPage from "./pages/DiagnosticResultPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import BadgeAdmin from "./pages/admin/BadgeAdmin";
import InitialAssessmentAdmin from "./pages/admin/InitialAssessmentAdmin";
import ItemShopAdmin from "./pages/admin/ItemShopAdmin";
import QuizAdmin from "./pages/admin/QuizAdmin";
import ScholarshipAdmin from "./pages/admin/ScholarshipAdmin";
import UniversityAdmin from "./pages/admin/UniversityAdmin";
import AuthPage from "./pages/AuthPage";
import ChooseAdventurePage from "./pages/ChooseAdventurePage";
import DashboardPage from "./pages/user/DashboardPage";
import Assessment2Page from "./pages/user/Assessment2Page";
import AIMentorPage from "./pages/user/AIMentorPage";
import EditProfilePage from "./pages/user/EditProfilePage";
import EmptyPage from "./pages/EmptyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoadingPage from "./pages/LoadingPage";
import LandingPage from "./pages/LandingPage";
import MentorDashboardPage, {
  ActionItemsPage,
  MenteeManagementPage,
  MentorActionPlansPage,
  MentorAvailabilityPage,
  MentorBookingsPage,
  MentorDocumentsPage,
  MentorDossierPage,
  MentorSessionsPage,
  MentorSettingsPage,
  MentorSupportPage,
} from "./pages/mentor/MentorDashboardPage";
import ProfilePage from "./pages/user/ProfilePage";
import QuestTrackerPage from "./pages/user/QuestTrackerPage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";
import BillingPage from "./pages/user/BillingPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import CoachingPage from "./pages/user/CoachingPage";
import DocumentValleyPage from "./pages/user/DocumentValleyPage";
import EssayPassPage from "./pages/user/EssayPassPage";
import { DIAGNOSTIC_RESULT_ROUTE } from "./utils/constants";
import AssessmentResetOnExit from "./utils/AssessmentResetOnExit";
import MentorProfilePage from "./pages/mentor/MentorProfilePage";
import UserManagement from "./pages/admin/UserManagement";

export default function App() {
  return (
    <>
      <AssessmentResetOnExit />

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ====================================================== */}

        {/* 1. Halaman Utama (Akses awal / Refresh akan masuk ke Loading Page dulu) */}
        <Route
          path="/"
          element={<LoadingPage />}
        />

        {/* 2. Halaman Landing Page setelah selesai Loading */}
        <Route
          path="/landing"
          element={<LandingPage />}
        />

        {/* 3. Akses manual /loading jika dipanggil dari navigasi lain */}
        <Route
          path="/loading"
          element={<LoadingPage />}
        />

        <Route
          path="/choose-adventure"
          element={<ChooseAdventurePage />}
        />

        {/*
         * Public free assessment.
         *
         * This route must remain outside ProtectedRoute and
         * RoleRoute so visitors can take the assessment before
         * registering or logging in.
         */}
        <Route
          path={INITIAL_ASSESSMENT_ROUTE}
          element={
            <InitialAssessmentRouteElement />
          }
        />

        <Route
          path={DIAGNOSTIC_RESULT_ROUTE}
          element={
            <DiagnosticResultPage />
          }
        />

        <Route
          path="/auth"
          element={<AuthPage />}
        />

        <Route
          path="/login"
          element={
            <Navigate
              to="/auth"
              replace
            />
          }
        />

        <Route
          path="/register"
          element={
            <Navigate
              to="/auth?mode=register"
              replace
            />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage />
          }
        />

        {/* =====================================================
            AUTHENTICATED ROUTES
        ====================================================== */}

        <Route
          element={<ProtectedRoute />}
        >
          {/* =================================================
              USER / EXPLORER ROUTES
          ================================================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "user",
                ]}
              />
            }
          >
            {/* Email verification */}

            <Route
              path="/verify-email"
              element={
                <VerificationPendingPage />
              }
            />

            <Route
              path="/verification-pending"
              element={
                <Navigate
                  to="/verify-email"
                  replace
                />
              }
            />

            {/* Main user routes */}

            <Route
              path="/dashboard"
              element={
                <DashboardPage />
              }
            />

            <Route
              path="/profile"
              element={
                <ProfilePage />
              }
            />

            <Route
              path="/profile/journey-log"
              element={
                <ProfilePage />
              }
            />

            <Route
              path="/profile/security"
              element={
                <ProfilePage />
              }
            />

            <Route
              path="/profile/edit"
              element={
                <EditProfilePage />
              }
            />

            {/* ===============================================
                AUTHENTICATED ONBOARDING ROUTES
            ================================================ */}

            <Route
              path="/onboarding"
              element={
                <Navigate
                  to="/onboarding/profile"
                  replace
                />
              }
            />

            <Route
              path="/onboarding/profile"
              element={
                <EmptyPage
                  title="Profile Onboarding"
                  description="Profile and scholarship preference onboarding will be implemented here."
                />
              }
            />

            {/*
             * The initial assessment route is intentionally not
             * included here because it is public.
             */}

            <Route
              path="/onboarding/readiness"
              element={
                <EmptyPage
                  title="Readiness Result"
                  description="The user's initial readiness result will be displayed here."
                />
              }
            />

            <Route
              path="/onboarding/primary-target"
              element={
                <EmptyPage
                  title="Select Primary Target"
                  description="The user will select their primary scholarship target here."
                />
              }
            />

            {/* ===============================================
                USER FEATURE ROUTES
            ================================================ */}

            <Route
              path="/quests"
              element={
                <QuestTrackerPage />
              }
            />

            {/*
             * Assessment 2 / Deep Diagnostic is a separate
             * authenticated Research Trail destination.
             *
             * It intentionally does not reuse the public
             * INITIAL_ASSESSMENT_ROUTE.
             */}
            <Route
              path={ASSESSMENT_2_ROUTE}
              element={
                <Assessment2Page />
              }
            />

            <Route
              path="/quests/document-valley"
              element={
                <DocumentValleyPage />
              }
            />

            <Route
              path="/quests/essay-pass"
              element={
                <EssayPassPage />
              }
            />

            <Route
              path="/scholarships"
              element={
                <EmptyPage
                  title="Scholarship Catalogue"
                  description="Available scholarship opportunities will be displayed here."
                />
              }
            />

            <Route
              path="/documents"
              element={
                <EmptyPage
                  title="Document Vault"
                  description="Uploaded scholarship documents will be managed here."
                />
              }
            />

            <Route
              path="/ally"
              element={
                <AIMentorPage />
              }
            />

            <Route
              path="/sessions"
              element={
                <CoachingPage />
              }
            />

            <Route
              path="/timeline"
              element={
                <EmptyPage
                  title="Expedition Timeline"
                  description="The user's dynamic scholarship timeline will be displayed here."
                />
              }
            />
            <Route
              path="/billing"
              element={
                <BillingPage />
              }
            />

            <Route
              path="/checkout"
              element={
                <CheckoutPage />
              }
            />
          </Route>

        {/* =================================================
            MENTOR ROUTES
        ================================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "mentor",
              ]}
            />
          }
        >
          <Route
            path="/mentor"
            element={
              <Navigate
                to="/mentor/dashboard"
                replace
              />
            }
          />

          <Route
            path="/mentor/dashboard"
            element={<MentorDashboardPage />}
          />

          <Route
            path="/mentor/mentees"
            element={<MenteeManagementPage />}
          />

          <Route
            path="/mentor/mentees/:menteeId"
            element={
              <EmptyPage
                title="Mentee Profile"
                description="The selected mentee's preparation profile will be displayed here."
              />
            }
          />

          <Route
            path="/mentor/dossier"
            element={<MentorDossierPage />}
          />

          <Route
            path="/mentor/availability"
            element={<MentorAvailabilityPage />}
          />

          <Route
            path="/mentor/bookings"
            element={<MentorBookingsPage />}
          />

          <Route
            path="/mentor/action-plans"
            element={<MentorActionPlansPage />}
          />

          <Route
            path="/mentor/documents"
            element={<MentorDocumentsPage />}
          />

          <Route
            path="/mentor/sessions"
            element={<MentorSessionsPage />}
          />

          <Route
            path="/mentor/sessions/:sessionId"
            element={
              <EmptyPage
                title="Mentor Session Workspace"
                description="The selected mentoring session will be managed here."
              />
            }
          />

          <Route
            path="/mentor/action-items"
            element={<ActionItemsPage />}
          />

          <Route
            path="/mentor/settings"
            element={<MentorSettingsPage />}
          />

          <Route
            path="/mentor/support"
            element={<MentorSupportPage />}
          />

          <Route
            path="/mentor/profile"
            element={<MentorProfilePage />}
          />
        </Route>

          {/* =================================================
              ADMIN ROUTES
          ================================================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "admin",
                ]}
              />
            }
          >
            <Route
              path="/admin"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />
            
            <Route
              path="/admin/dashboard"
              element={
                <AdminDashboardPage />
              }
            />

            <Route
              path="/admin/university"
              element={<UniversityAdmin />}
            />

            <Route
              path="/admin/scholarships"
              element={<ScholarshipAdmin />}
            />

            <Route
              path="/admin/scholarships/:scholarshipId/edit"
              element={
                <EmptyPage
                  title="Edit Scholarship"
                  description="Update an existing scholarship entry."
                />
              }
            />

            <Route
              path="/admin/assessment"
              element={<InitialAssessmentAdmin />}
            />

            <Route
              path="/admin/shop"
              element={<ItemShopAdmin />}
            />

            <Route
              path="/admin/quiz"
              element={<QuizAdmin />}
            />

            <Route
              path="/admin/badges"
              element={<BadgeAdmin />}
            />

            <Route
              path="/admin/users"
              element={<UserManagement />}
            />

            <Route
              path="/admin/users/:userId"
              element={
                <EmptyPage
                  title="User Detail"
                  description="View and manage an individual platform user."
                />
              }
            />

            <Route
              path="/admin/payments"
              element={
                <EmptyPage
                  title="Payment Management"
                  description="Monitor payments, transaction status, and package activation."
                />
              }
            />

            <Route
              path="/admin/mentors"
              element={
                <EmptyPage
                  title="Mentor Management"
                  description="Manage mentor accounts, profiles, and availability."
                />
              }
            />

            <Route
              path="/admin/capacity"
              element={
                <EmptyPage
                  title="Capacity Monitoring"
                  description="Monitor mentor availability and platform capacity."
                />
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <EmptyPage
                  title="Platform Analytics"
                  description="Review user activity, sales, and feature usage."
                />
              }
            />

            <Route
              path="/admin/settings"
              element={
                <EmptyPage
                  title="Admin Settings"
                  description="Manage platform configuration and operational settings."
                />
              }
            />
          </Route>
        </Route>

        {/* =====================================================
            FALLBACK ROUTE
        ====================================================== */}

        <Route
          path="*"
          element={
            <EmptyPage
              title="Page Not Found"
              description="The requested expedition route does not exist."
            />
          }
        />
      </Routes>
    </>
  );
}