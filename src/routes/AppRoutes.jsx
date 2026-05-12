import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LiveMonitor } from '@/pages/LiveMonitor'
import { Login } from '@/pages/Login'
import { CategoriesManage } from '@/pages/CategoriesManage'
import { ServicesManage } from '@/pages/ServicesManage'
import { UsersManage } from '@/pages/UsersManage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/monitor" replace />} />
          <Route path="/monitor" element={<LiveMonitor />} />
          <Route path="/categories" element={<CategoriesManage />} />
          <Route path="/services" element={<ServicesManage />} />
          <Route path="/users" element={<UsersManage />} />
          <Route path="*" element={<Navigate to="/monitor" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
