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

// ============================================================
// PUBLIC / GENERAL PAGES
// ============================================================

import AuthPage from "./pages/AuthPage";
import EmptyPage from "./pages/EmptyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";
import ChooseAdventurePage from "./pages/ChooseAdventurePage";

// ============================================================
// USER / EXPLORER PAGES
// ============================================================

import DashboardPage from "./pages/user/DashboardPage";
import EditProfilePage from "./pages/user/EditProfilePage";
import ProfilePage from "./pages/user/ProfilePage";
import ResetPasswordPage from "./pages/user/ResetPasswordPage";

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// ============================================================
// MENTOR PAGES
// ============================================================

import MentorDashboardPage from "./pages/mentor/MentorDashboardPage";
import MenteeManagementPage from "./pages/mentor/MenteeManagementPage";
import MentorDossierPage from "./pages/mentor/MentorDossierPage";
import MentorAvailabilityPage from "./pages/mentor/MentorAvailabilityPage";
import MentorBookingsPage from "./pages/mentor/MentorBookingsPage";
import MentorActionPlansPage from "./pages/mentor/MentorActionPlansPage";
import MentorDocumentsPage from "./pages/mentor/MentorDocumentsPage";
import MentorSettingsPage from "./pages/mentor/MentorSettingsPage";
import MentorSupportPage from "./pages/mentor/MentorSupportPage";
import MentorSessionsPage from "./pages/mentor/MentorSessionsPage";
import ActionItemsPage from "./pages/mentor/ActionItemsPage";
import MentorProfilePage from "./pages/mentor/MentorProfilePage";

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
          {/* =================================================
              EMAIL VERIFICATION
          ================================================== */}

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

          {/* =================================================
              MAIN USER ROUTES
          ================================================== */}

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

          {/* =================================================
              ONBOARDING
          ================================================== */}

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

          {/* =================================================
              INITIAL ASSESSMENT
          ================================================== */}

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

          {/* =================================================
              USER FEATURE ROUTES
          ================================================== */}

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
          {/* =================================================
              MENTOR DASHBOARD
          ================================================== */}

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

          {/* =================================================
              MENTEE / EXPLORER MANAGEMENT
          ================================================== */}

          <Route
            path="/mentor/mentees"
            element={<MenteeManagementPage />}
          />

          {/* =================================================
              MENTOR DOSSIER
          ================================================== */}

          <Route
            path="/mentor/dossier"
            element={<MentorDossierPage />}
          />

          {/* =================================================
              AVAILABILITY
          ================================================== */}

          <Route
            path="/mentor/availability"
            element={<MentorAvailabilityPage />}
          />

          {/* =================================================
              SESSION MANAGEMENT
          ================================================== */}

          <Route
            path="/mentor/sessions"
            element={<MentorSessionsPage />}
          />

          {/* =================================================
              BOOKING CONFIRMATION
          ================================================== */}

          <Route
            path="/mentor/bookings"
            element={<MentorBookingsPage />}
          />

          {/* =================================================
              ACTION PLANS
          ================================================== */}

          <Route
            path="/mentor/action-plans"
            element={<MentorActionPlansPage />}
          />

          {/* =================================================
              ACTION ITEMS
          ================================================== */}

          <Route
            path="/mentor/action-items"
            element={<ActionItemsPage />}
          />

          {/* =================================================
              DOCUMENTS
          ================================================== */}

          <Route
            path="/mentor/documents"
            element={<MentorDocumentsPage />}
          />

          {/* =================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/mentor/settings"
            element={<MentorSettingsPage />}
          />

          {/* =================================================
              SUPPORT
          ================================================== */}

          <Route
            path="/mentor/support"
            element={<MentorSupportPage />}
          />

          {/* =================================================
              MENTOR PROFILE / PASSPORT
          ================================================== */}

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
          {/* =================================================
              ADMIN ROOT
          ================================================== */}

          <Route
            path="/admin"
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          {/* =================================================
              ADMIN DASHBOARD
          ================================================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage />}
          />

          {/* =================================================
              USER MANAGEMENT
          ================================================== */}

          <Route
            path="/admin/users"
            element={
              <EmptyPage
                title="User Management"
                description="Manage Explorer, Mentor, and Admin accounts."
              />
            }
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

          {/* =================================================
              SCHOLARSHIP MANAGEMENT
          ================================================== */}

          <Route
            path="/admin/scholarships"
            element={
              <EmptyPage
                title="Scholarship Management"
                description="Create, edit, publish, and archive scholarship data."
              />
            }
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

          {/* =================================================
              MENTOR MANAGEMENT
          ================================================== */}

          <Route
            path="/admin/mentors"
            element={
              <EmptyPage
                title="Mentor Management"
                description="Manage mentor accounts, profiles, and availability."
              />
            }
          />

          {/* =================================================
              CAPACITY
          ================================================== */}

          <Route
            path="/admin/capacity"
            element={
              <EmptyPage
                title="Capacity Monitoring"
                description="Monitor mentor availability and platform capacity."
              />
            }
          />

          {/* =================================================
              PAYMENTS
          ================================================== */}

          <Route
            path="/admin/payments"
            element={
              <EmptyPage
                title="Payment Management"
                description="Review payment transactions and package activation."
              />
            }
          />

          {/* =================================================
              ANALYTICS
          ================================================== */}

          <Route
            path="/admin/analytics"
            element={
              <EmptyPage
                title="Platform Analytics"
                description="Review user activity, sales, and feature usage."
              />
            }
          />

          {/* =================================================
              ADMIN SETTINGS
          ================================================== */}

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
