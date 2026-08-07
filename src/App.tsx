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

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import FinancePage from "./pages/admin/Finance";
import UserManagement from "./pages/admin/UserManagement";
import UniversityAdmin from "./pages/admin/UniversityAdmin";
import ScholarshipAdmin from "./pages/admin/ScholarshipAdmin";
import InitialAssessmentAdmin from "./pages/admin/InitialAssessmentAdmin";
import ItemShopAdmin from "./pages/admin/ItemShopAdmin";
import QuizAdmin from "./pages/admin/QuizAdmin";
import BadgeAdmin from "./pages/admin/BadgeAdmin";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/user/DashboardPage";
import EditProfilePage from "./pages/user/EditProfilePage";
import EmptyPage from "./pages/EmptyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import MentorDashboardPage from "./pages/mentor/MentorDashboardPage";
import ProfilePage from "./pages/user/ProfilePage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";
import ChooseAdventurePage from "./pages/ChooseAdventurePage.tsx";

export default function App() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/choose-adventure"
        element={<ChooseAdventurePage />}
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
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* =====================================================
          AUTHENTICATED ROUTES
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
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
            element={<VerificationPendingPage />}
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
            element={<DashboardPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/profile/journey-log"
            element={<ProfilePage />}
          />

          <Route
            path="/profile/security"
            element={<ProfilePage />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfilePage />}
          />

          {/* ===============================================
              ONBOARDING ROUTES
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

          {/* Initial Scholarship Readiness Assessment */}

          <Route
            path={INITIAL_ASSESSMENT_ROUTE}
            element={
              <InitialAssessmentRouteElement />
            }
          />

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
              <EmptyPage
                title="Quest Tracker"
                description="The user's scholarship preparation quests will be displayed here."
              />
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
              <EmptyPage
                title="Ally AI Mentor"
                description="The AI scholarship companion will be implemented here."
              />
            }
          />

          <Route
            path="/sessions"
            element={
              <EmptyPage
                title="Mentor Sessions"
                description="The user's mentor sessions will be displayed here."
              />
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
            path="/checkout"
            element={
              <EmptyPage
                title="Checkout"
                description="Package and payment checkout will be implemented here."
              />
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
            element={
              <EmptyPage
                title="My Mentees"
                description="The mentor mentee-management page will be implemented later."
              />
            }
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
            path="/mentor/mentees/:menteeId/dossier"
            element={
              <EmptyPage
                title="Pre-Session Dossier"
                description="The mentee's pre-session preparation summary will be displayed here."
              />
            }
          />

          <Route
            path="/mentor/availability"
            element={
              <EmptyPage
                title="Mentor Availability"
                description="The mentor scheduling page will be implemented later."
              />
            }
          />

          <Route
            path="/mentor/sessions"
            element={
              <EmptyPage
                title="Mentor Sessions"
                description="The mentor session-management page will be implemented later."
              />
            }
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
            element={
              <EmptyPage
                title="Mentee Action Items"
                description="The post-session action-item page will be implemented later."
              />
            }
          />

          <Route
            path="/mentor/profile"
            element={
              <EmptyPage
                title="Mentor Profile"
                description="The mentor profile page will be implemented later."
              />
            }
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
            element={<AdminDashboardPage />}
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
            path="/admin/university"
            element={<UniversityAdmin />}
          />

          <Route
            path="/admin/scholarships"
            element={<ScholarshipAdmin />}
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
            path="/admin/scholarships/new"
            element={
              <EmptyPage
                title="Add Scholarship"
                description="Create a new scholarship entry."
              />
            }
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
            path="/admin/payments"
            element={<FinancePage />}
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
  );
}