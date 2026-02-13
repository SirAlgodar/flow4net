export interface PermissionResult {
  granted: boolean;
  error?: string;
  data?: any;
}

export class ClientPermissions {
  
  static async requestGeolocation(): Promise<PermissionResult> {
    if (!('geolocation' in navigator)) {
      return { granted: false, error: 'Geolocation not supported' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            granted: true,
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
        },
        (error) => {
          let errorMsg = 'Unknown error';
          switch(error.code) {
            case error.PERMISSION_DENIED: errorMsg = 'User denied permission'; break;
            case error.POSITION_UNAVAILABLE: errorMsg = 'Position unavailable'; break;
            case error.TIMEOUT: errorMsg = 'Timeout'; break;
          }
          resolve({ granted: false, error: errorMsg });
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  static async requestMediaDevices(): Promise<PermissionResult> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { granted: false, error: 'MediaDevices API not supported' };
    }

    try {
      // Request both audio and video to check permissions
      // We stop the tracks immediately after getting them
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      const tracks = stream.getTracks();
      const info = tracks.map(t => ({ kind: t.kind, label: t.label, enabled: t.enabled }));
      
      // Stop all tracks to release the hardware
      tracks.forEach(track => track.stop());

      return {
        granted: true,
        data: info
      };
    } catch (err: any) {
      // If user denies, we get NotAllowedError
      // If hardware is missing, we might get NotFoundError
      return { granted: false, error: err.name || err.message };
    }
  }

  /**
   * Checks for Notifications permission (useful for background tests completion alerts)
   */
  static async requestNotification(): Promise<PermissionResult> {
    if (!('Notification' in window)) {
       return { granted: false, error: 'Notifications not supported' };
    }

    if (Notification.permission === 'granted') {
      return { granted: true };
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted' };
    }

    return { granted: false, error: 'Permission previously denied' };
  }
}
