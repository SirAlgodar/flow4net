export interface PermissionResult {
  granted: boolean;
  error?: string;
  data?: any;
}

export class ClientPermissions {
  
  static async requestGeolocation(): Promise<PermissionResult> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { granted: false, error: 'Geolocalização indisponível neste ambiente' };
    }

    if (!('geolocation' in navigator)) {
      return { granted: false, error: 'Geolocalização não suportada pelo navegador' };
    }

    const hostname = window.location?.hostname || '';
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!window.isSecureContext && !isLocalhost) {
      return {
        granted: false,
        error: 'Geolocalização bloqueada: o navegador exige HTTPS ou localhost para acessar a localização'
      };
    }

    const inIframe = window.self !== window.top;

    if (inIframe && (navigator as any).permissions && (navigator as any).permissions.query) {
      try {
        const status = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          return {
            granted: false,
            error: 'Geolocalização bloqueada pela política de permissões do navegador (iframe ou domínio pai)'
          };
        }
      } catch {
      }
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
          let errorMsg = 'Erro desconhecido ao obter localização';
          const msg = (error && (error as any).message ? String((error as any).message) : '').toLowerCase();

          switch (error.code) {
            case error.PERMISSION_DENIED:
              if (!window.isSecureContext && !isLocalhost) {
                errorMsg = 'O navegador bloqueou a geolocalização por estar em HTTP. Use HTTPS ou localhost.';
              } else if (msg.includes('only secure origins') || msg.includes('https')) {
                errorMsg = 'O navegador requer HTTPS para liberar a geolocalização neste domínio.';
              } else if (inIframe) {
                errorMsg = 'A geolocalização foi bloqueada em modo embutido (iframe). Abra o teste em nova aba.';
              } else {
                errorMsg = 'Permissão de localização negada nas configurações do navegador ou do site.';
              }
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Localização indisponível no dispositivo no momento';
              break;
            case error.TIMEOUT:
              errorMsg = 'Tempo esgotado ao tentar obter a localização';
              break;
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

  /**
   * Request Network Information permissions (Android specific mostly)
   * On Web, this is mostly tied to Geolocation for scanning or just accessing navigator.connection
   */
  static async requestNetworkPermissions(): Promise<PermissionResult> {
    // 1. Check if Network Information API is available
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    // 2. Request Geolocation (often required for detailed network info on mobile)
    const geoResult = await this.requestGeolocation();
    
    if (!geoResult.granted) {
        return { 
            granted: false, 
            error: geoResult.error || 'Location permission denied (required for network details)' 
        };
    }

    // 3. Return combined success
    return {
        granted: true,
        data: {
            geolocation: geoResult.data,
            connection: conn ? {
                type: conn.type,
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            } : null
        }
    };
  }
}
