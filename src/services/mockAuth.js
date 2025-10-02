// Mock authentication service for development/fallback when Supabase is unavailable
// This should be used only in development and testing environments

// Mock admin users
const MOCK_ADMINS = [
  {
    id: '1',
    email: 'akshayanataraj09@gmail.com',
    name: 'Akshaya Admin',
    password: 'admin123', // In a real app, never store plain text passwords
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Test Admin',
    password: 'password123',
  }
];

// Simulate network delay for more realistic behavior
const simulateDelay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Login function
export async function mockLogin(email, password) {
  // Simulate network delay
  await simulateDelay();
  
  // Find matching admin
  const admin = MOCK_ADMINS.find(a => 
    a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  
  if (!admin) {
    throw new Error('Invalid email or password');
  }
  
  // Create mock session
  const session = {
    access_token: `mock_token_${admin.id}_${Date.now()}`,
    expires_at: Date.now() + 3600000, // 1 hour from now
  };
  
  // Store in localStorage to persist the session
  localStorage.setItem('mock_auth_token', session.access_token);
  localStorage.setItem('mock_auth_user', JSON.stringify({
    id: admin.id,
    email: admin.email,
    name: admin.name,
  }));
  
  return {
    user: {
      id: admin.id,
      email: admin.email,
    },
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
    session
  };
}

// Logout function
export async function mockLogout() {
  await simulateDelay(500);
  localStorage.removeItem('mock_auth_token');
  localStorage.removeItem('mock_auth_user');
  return true;
}

// Get current admin
export async function mockGetCurrentAdmin() {
  const token = localStorage.getItem('mock_auth_token');
  const userJson = localStorage.getItem('mock_auth_user');
  
  if (!token || !userJson) {
    return null;
  }
  
  try {
    const user = JSON.parse(userJson);
    
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.error('Error parsing mock user data:', error);
    return null;
  }
}

// Check if mock auth is being used
export function isMockAuthActive() {
  return !!localStorage.getItem('mock_auth_token');
}
