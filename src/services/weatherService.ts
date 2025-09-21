import { WeatherResponse, ForecastResponse, WeatherData, WeatherError } from '@/types/weather';
import { WEATHER_CONFIG, API_ENDPOINTS, formatTime, formatDate, getWeatherIconUrl } from '@/config/weather';

class WeatherService {
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Weather service error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async getCurrentWeatherByCity(city: string): Promise<WeatherData> {
    const url = `${API_ENDPOINTS.CURRENT_WEATHER}?q=${encodeURIComponent(city)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}`;
    
    try {
      const data: WeatherResponse = await this.makeRequest<WeatherResponse>(url);
      return this.transformWeatherData(data);
    } catch (error) {
      throw new Error(`Failed to fetch weather for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    const url = `${API_ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}`;
    
    try {
      const data: WeatherResponse = await this.makeRequest<WeatherResponse>(url);
      return this.transformWeatherData(data);
    } catch (error) {
      throw new Error(`Failed to fetch weather for coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getForecastByCity(city: string): Promise<ForecastResponse> {
    const url = `${API_ENDPOINTS.FORECAST}?q=${encodeURIComponent(city)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}`;
    
    try {
      return await this.makeRequest<ForecastResponse>(url);
    } catch (error) {
      throw new Error(`Failed to fetch forecast for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
    const url = `${API_ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}`;
    
    try {
      return await this.makeRequest<ForecastResponse>(url);
    } catch (error) {
      throw new Error(`Failed to fetch forecast for coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformWeatherData(data: WeatherResponse): WeatherData {
    return {
      temp: data.main.temp.toFixed(1),
      humidity: data.main.humidity,
      feelsLike: data.main.feels_like.toFixed(1),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // Convert to km
      sunrise: formatTime(data.sys.sunrise),
      sunset: formatTime(data.sys.sunset),
    };
  }

  async getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser. Please try searching for a city instead.'));
        return;
      }

      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        reject(new Error('Location access requires a secure connection (HTTPS). Please search for a city instead.'));
        return;
      }

      // Check permission state first
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
          console.log('📍 Permission state:', result.state);
          
          if (result.state === 'denied') {
            reject(new Error('Location access is blocked. Please enable location access in your browser settings or search for a city instead.'));
            return;
          }
          
          // If permission is granted, proceed immediately
          if (result.state === 'granted') {
            this.requestLocation(resolve, reject);
            return;
          }
          
          // If permission is prompt, wait a moment for user to respond
          if (result.state === 'prompt') {
            console.log('📍 Permission prompt detected, waiting for user response...');
            // Listen for permission changes
            result.addEventListener('change', () => {
              console.log('📍 Permission state changed to:', result.state);
              if (result.state === 'granted') {
                this.requestLocation(resolve, reject);
              } else if (result.state === 'denied') {
                reject(new Error('Location access denied. Please allow location access or search for a city instead.'));
              }
            });
            
            // Also try to request location directly (some browsers don't fire change events)
            setTimeout(() => {
              this.requestLocation(resolve, reject);
            }, 1000);
            return;
          }
          
          // Fallback: try to request location
          this.requestLocation(resolve, reject);
        }).catch((error) => {
          console.log('📍 Permissions API error:', error);
          // If permissions API fails, proceed with location request
          this.requestLocation(resolve, reject);
        });
      } else {
        // If permissions API is not supported, proceed with location request
        this.requestLocation(resolve, reject);
      }
    });
  }

  private requestLocation(resolve: (value: { lat: number; lon: number }) => void, reject: (reason?: any) => void) {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased timeout to 20 seconds
      maximumAge: 300000, // 5 minutes
    };

    let hasResolved = false;
    let timeoutId: NodeJS.Timeout;

    // Set a timeout to prevent hanging
    timeoutId = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        console.log('⏰ Geolocation request timed out');
        reject(new Error('Location request timed out. Please try again or search for a city instead.'));
      }
    }, 25000); // 25 second total timeout

    console.log('🌍 Requesting location with options:', options);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          console.log('✅ Location obtained successfully:', {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        }
      },
      (error) => {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          console.log('❌ Geolocation error:', {
            code: error.code,
            message: error.message
          });
          
          let message = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please allow location access in your browser settings or search for a city instead.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable. Please try searching for a city instead.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out. Please try again or search for a city instead.';
              break;
            default:
              message = 'Location access is not available. Please search for a city instead.';
              break;
          }
          reject(new Error(message));
        }
      },
      options
    );
  }
}

export const weatherService = new WeatherService();
