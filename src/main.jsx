import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.jsx';
import Home from './pages/Home';
import FranchiseDetails from './pages/FranchiseDetails';
import SearchResults from './pages/SearchResults';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import About from './pages/About.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import ErrorBoundary from './components/common/ErrorBoundary';

import './index.css';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { path: '', element: <Home /> },
        { path: 'franchise/:id', element: <FranchiseDetails /> },
        { path: 'search', element: <SearchResults /> },

        {
          path: 'admin',
          children: [
            { path: 'login', element: <AdminLogin /> },
            {
              path: 'dashboard',
              element: (
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              ),
            },
            // Catch-all for /admin/*
            { path: '*', element: <Navigate to="/admin/login" replace /> },
          ],
        },

        { path: 'about', element: <About /> },
        { path: 'gallery', element: <Gallery /> },
        { path: 'contact', element: <Contact /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_startTransition: true,
    },
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>
);
