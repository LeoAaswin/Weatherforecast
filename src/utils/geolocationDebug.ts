// Geolocation debugging utilities
export const debugGeolocation = () => {
  const debugInfo = {
    isSupported: !!navigator.geolocation,
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    permissionsApi: typeof navigator.permissions !== 'undefined',
  };

  console.log('🌍 Geolocation Debug Info:', debugInfo);

  // Check permissions if available
  if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        console.log('📍 Geolocation Permission State:', result.state);
        return result;
      })
      .catch((error) => {
        console.log('❌ Permission Query Error:', error);
      });
  }

  return debugInfo;
};

export const testGeolocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('🔍 Testing geolocation...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Geolocation success:', position.coords);
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log('❌ Geolocation error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};
