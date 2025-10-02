import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import FranchiseDetails from './pages/FranchiseDetails'
import SearchResults from './pages/SearchResults'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from './components/common/ErrorBoundary'
import About from './pages/About.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import './index.css'
import App from './App.jsx'

// Create router with future flags enabled
const router = createBrowserRouter([{
  path: '/',
  element: <App />,
  children: [
    { path: "/", element: <Home /> },
    { path: "/franchise/:id", element: <FranchiseDetails /> },
    { path: "/search", element: <SearchResults /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    )},
    // Redirect any other admin routes to login
    { path: "/admin/*", element: <AdminLogin /> },
  { path: "/about", element: <About /> },
  { path: "/gallery", element: <Gallery /> },
  { path: "/contact", element: <Contact /> }
  ]
}], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
