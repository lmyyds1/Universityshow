import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import AdminGuard, { isAdminAuthenticated } from './components/AdminGuard'
import Home from './pages/Home'
import UniversityDetail from './pages/UniversityDetail'
import Dashboard from './pages/admin/Dashboard'
import UniversityForm from './pages/admin/UniversityForm'
import TagManager from './pages/admin/TagManager'
import RatingManager from './pages/admin/RatingManager'
import CommentManager from './pages/admin/CommentManager'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>
}

function AdminRoute() {
  if (!isAdminAuthenticated()) return <Navigate to="/admin/login" replace />
  return <AdminLayout />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/school/:id" element={<UniversityDetail />} />
      </Route>
      <Route path="/admin" element={<ProtectedRoute><AdminRoute /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="university/new" element={<UniversityForm />} />
        <Route path="university/:id/edit" element={<UniversityForm />} />
        <Route path="university/:id/tags" element={<TagManager />} />
        <Route path="university/:id/ratings" element={<RatingManager />} />
        <Route path="comments" element={<CommentManager />} />
      </Route>
      <Route path="/admin/login" element={<AdminGuard><Navigate to="/admin" replace /></AdminGuard>} />
    </Routes>
  )
}
