import { Route, Routes } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { Services } from '@/pages/Services'
import { Users } from '@/pages/Users'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Services />} />
        <Route path="/about" element={<Users />} />
      </Route>
    </Routes>
  )
}
