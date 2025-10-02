const env = import.meta.env

export const config = {
  // Environment
  isDevelopment: env.DEV,
  isProduction: env.PROD,
  isTest: env.MODE === 'test',
  
  // API Configuration
  supabase: {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY,
  },
  
  // App Configuration
  app: {
    name: 'Rodar Franchise World',
    version: env.VITE_APP_VERSION || '1.0.0',
    description: 'Franchising Platform',
    url: env.VITE_APP_URL || 'http://localhost:5173',
  },
  
  // Feature Flags
  features: {
    analytics: env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: env.VITE_ENABLE_ERROR_REPORTING === 'true',
    performanceMonitoring: env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  },
  
  // External Services
  services: {
    contactEmail: env.VITE_CONTACT_EMAIL || 'info@rodarbusiness.com',
    supportPhone: env.VITE_SUPPORT_PHONE || '+91-98765-43210',
  },
  
  // Performance
  performance: {
    debounceDelay: 300,
    imageLazyLoadThreshold: 0.1,
    infiniteScrollThreshold: 0.8,
  },
  
  // SEO
  seo: {
    defaultTitle: 'Rodar Franchise World - Franchising Platform',
    defaultDescription: 'Connect with high-potential franchises and serious investors through our trusted franchising platform.',
    defaultKeywords: ['franchise', 'business opportunity', 'investment', 'entrepreneurship', 'India'],
    ogImage: '/og-image.jpg',
    twitterHandle: '@rodarbusiness',
  }
}

// Validate required environment variables
export function validateEnvironment() {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missing = required.filter(key => !env[key])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Initialize environment validation
if (config.isDevelopment) {
  validateEnvironment()
}
