// Environment configuration
export const ENV_CONFIG = {
  // OpenWeatherMap API Configuration
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'ca695dcbc66c5fa3d0cb955033fd918f',
  OPENWEATHER_BASE_URL: process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  OPENWEATHER_ICON_URL: process.env.NEXT_PUBLIC_OPENWEATHER_ICON_URL || 'https://openweathermap.org/img/wn',
  
  // App Configuration
  APP_NAME: 'Weather Forecast',
  APP_DESCRIPTION: 'Modern weather forecast application',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
  
  // Development
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

// Validate required environment variables
export const validateEnv = () => {
  const requiredVars = ['NEXT_PUBLIC_OPENWEATHER_API_KEY'] as const;
  
  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
  
  return missingVars.length === 0;
};

// Initialize environment validation
if (typeof window === 'undefined') {
  validateEnv();
}
