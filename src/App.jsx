import { Outlet, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import FranchiseDetails from './pages/FranchiseDetails'
import SearchResults from './pages/SearchResults'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/common/ProtectedRoute'

export default function App() {
  return <Outlet />
}
