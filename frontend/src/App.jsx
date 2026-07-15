import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CandidatesPage from './pages/CandidatesPage'
import CandidateDetailPage from './pages/CandidateDetailPage'
import UploadPage from './pages/UploadPage'
import JobDescriptionsPage from './pages/JobDescriptionsPage'
import ComparisonPage from './pages/ComparisonPage'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <Layout>
                <CandidatesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidates/:candidateId"
          element={
            <ProtectedRoute>
              <Layout>
                <CandidateDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <UploadPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-descriptions"
          element={
            <ProtectedRoute>
              <Layout>
                <JobDescriptionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Layout>
                <ComparisonPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <ChatPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App