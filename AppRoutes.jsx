import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'

import Login from '../pages/Login'
import AdminDashboard from '../pages/AdminDashboard'
import TeacherDashboard from '../pages/TeacherDashboard'
import StudentDashboard from '../pages/StudentDashboard'
import StudentScanner from '../pages/StudentScanner'

import StudentsPage from '../pages/StudentsPage'
import TeachersPage from '../pages/TeachersPage'
import SubjectsPage from '../pages/SubjectsPage'
import PenaltiesPage from '../pages/PenaltiesPage'
import AttendanceSessionsPage from '../pages/AttendanceSessionsPage'
import AIWatchlistPage from '../pages/AIWatchlistPage'
import RiskProfilePage from '../pages/RiskProfilePage'


function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  // User not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User doesn't have permission
  if (
    roles &&
    !roles.includes(user?.role)
  ) {
    return (
      <Navigate
        to={`/${user?.role}`}
        replace
      />
    )
  }

  return children
}


function RoleRedirect() {
  const {
    isAuthenticated,
    user,
  } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return (
    <Navigate
      to={`/${user?.role}`}
      replace
    />
  )
}


export default function AppRoutes() {
  return (

    <Routes>

      {/* Login */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* Root Redirect */}

      <Route
        path="/"
        element={<RoleRedirect />}
      />


      {/* Protected Dashboard Layout */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >


        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute roles={['admin']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers"
          element={
            <ProtectedRoute roles={['admin']}>
              <TeachersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subjects"
          element={
            <ProtectedRoute roles={['admin']}>
              <SubjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watchlist"
          element={
            <ProtectedRoute roles={['admin']}>
              <AIWatchlistPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/penalties"
          element={
            <ProtectedRoute roles={['admin']}>
              <PenaltiesPage />
            </ProtectedRoute>
          }
        />


        {/* ================= SHARED ROUTES ================= */}

        <Route
          path="/sessions"
          element={
            <ProtectedRoute
              roles={['admin', 'teacher']}
            >
              <AttendanceSessionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk-profile/:id"
          element={
            <ProtectedRoute
              roles={['admin', 'teacher']}
            >
              <RiskProfilePage />
            </ProtectedRoute>
          }
        />


        {/* ================= TEACHER ROUTES ================= */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />


        {/* ================= STUDENT ROUTES ================= */}

        {/* Student Dashboard */}

        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        {/* QR Scanner */}

        <Route
          path="/student/scan"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentScanner />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* Unknown Routes */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  )
}