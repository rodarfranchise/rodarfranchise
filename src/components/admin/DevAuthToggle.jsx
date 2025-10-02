import { useState, useEffect } from 'react'

export default function DevAuthToggle({ onlyOnLoginPage = true }) {
  const [useMockAuth, setUseMockAuth] = useState(
    localStorage.getItem('use_mock_auth') === 'true'
  )
  
  // Check if we're on the login page by examining the URL directly
  const [isLoginPage, setIsLoginPage] = useState(false)
  
  // Update localStorage when toggle changes
  useEffect(() => {
    localStorage.setItem('use_mock_auth', useMockAuth ? 'true' : 'false')
  }, [useMockAuth])
  
  // Check if we're on the login page
  useEffect(() => {
    const isAdminLoginPage = window.location.pathname.includes('/admin/login')
    setIsLoginPage(isAdminLoginPage)
  }, [])
  
  // Only show in development mode and on the login page if required
  if (import.meta.env.MODE !== 'development' || (onlyOnLoginPage && !isLoginPage)) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg text-xs z-50">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-yellow-800">Dev Mode:</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={useMockAuth}
            onChange={() => setUseMockAuth(!useMockAuth)}
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2 text-xs font-medium text-yellow-900">
            {useMockAuth ? 'Mock Auth' : 'Real Auth'}
          </span>
        </label>
      </div>
      {useMockAuth && (
        <div className="mt-2 text-yellow-800">
          <p>Using mock authentication</p>
          <p className="mt-1">Email: <code>akshayanataraj09@gmail.com</code></p>
          <p>Password: <code>admin123</code></p>
        </div>
      )}
    </div>
  )
}
