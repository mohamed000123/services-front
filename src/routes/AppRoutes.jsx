import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LiveMonitor } from '@/pages/LiveMonitor'
import { ServicesManage } from '@/pages/ServicesManage'
import { UsersManage } from '@/pages/UsersManage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/monitor" replace />} />
        <Route path="/monitor" element={<LiveMonitor />} />
        <Route path="/services" element={<ServicesManage />} />
        <Route path="/users" element={<UsersManage />} />
        <Route path="*" element={<Navigate to="/monitor" replace />} />
      </Route>
    </Routes>
  )
}
