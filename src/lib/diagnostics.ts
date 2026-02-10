export interface DiagnosticResult {
  device: {
    userAgent: string;
    os: string;
    browser: string;
    deviceMemory?: number;
    hardwareConcurrency?: number;
    gpu?: string;
  };
  network: {
    ip: string;
    connectionType?: string;
    downlink?: number; 
    rtt?: number;
    saveData?: boolean;
    effectiveType?: string;
    signalStrength?: number; // Simulated/Approximated
    frequency?: number; // Simulated
  };
  quality?: {
    score: number;
    rating: 'Excelente' | 'Bom' | 'Regular' | 'Ruim' | 'Crítico';
    issues: string[];
    recommendations: string[];
  };
  speed: {
    download: number; 
    upload: number; 
    ping: number; 
    jitter: number; 
  };
  streaming: {
    sd: boolean;
    hd: boolean;
    fullHd: boolean;
    uhd: boolean;
  };
  externalStatus?: string;
}

export class DiagnosticsEngine {
  private updateCallback: (status: string, progress: number) => void;

  constructor(onUpdate: (status: string, progress: number) => void) {
    this.updateCallback = onUpdate;
  }

  async run(): Promise<DiagnosticResult> {
    this.updateCallback('Coletando informações do dispositivo...', 0);
    const device = this.getDeviceInfo();
    
    this.updateCallback('Detectando IP...', 10);
    const ip = await this.getPublicIp();
    
    this.updateCallback('Testando Latência...', 20);
    const { ping, jitter } = await this.measureLatency();
    
    this.updateCallback('Testando Download...', 40);
    const download = await this.measureDownloadSpeed();
    
    this.updateCallback('Testando Upload...', 70);
    const upload = await this.measureUploadSpeed();
    
    this.updateCallback('Verificando serviços externos...', 85);
    const externalStatus = await this.checkExternalServices();

    this.updateCallback('Analisando qualidade da conexão...', 88);
    const networkInfo = (navigator as any).connection || {};
    
    // Log network info for debugging
    console.log('Network Information API:', networkInfo);
    
    const quality = this.analyzeQuality(download, upload, ping, jitter, networkInfo);

    this.updateCallback('Finalizando...', 90);

    const streaming = {
      sd: download > 1.5,
      hd: download > 5,
      fullHd: download > 8, 
      uhd: download > 25,
    };
    
    // Ensure values are not undefined/null if possible, or leave as undefined for UI to handle
    const connectionType = networkInfo.type || 'unknown';
    const effectiveType = networkInfo.effectiveType || 'unknown';
    const downlink = networkInfo.downlink;
    const rtt = networkInfo.rtt;
    
    console.log('Captured Network Details:', { connectionType, effectiveType, downlink, rtt });

    return {
      device,
      network: {
        ip,
        connectionType,
        effectiveType: networkInfo.effectiveType,
        downlink: networkInfo.downlink,
        rtt: networkInfo.rtt,
        saveData: networkInfo.saveData,
        // Simulating WiFi details as standard Web API doesn't expose SSID/Signal Strength due to privacy
        // In a real app, this might need a native wrapper or specific browser flags
        signalStrength: this.estimateSignalStrength(networkInfo.rtt, networkInfo.downlink),
        frequency: networkInfo.effectiveType === '4g' ? undefined : 2.4 // Assumption/Simulation
      },
      speed: {
        download,
        upload,
        ping,
        jitter,
      },
      streaming,
      externalStatus,
      quality
    };
  }

  private estimateSignalStrength(rtt: number = 0, downlink: number = 0): number {
      // Crude estimation: lower RTT + higher downlink = better signal
      let score = 100;
      if (rtt > 100) score -= 20;
      if (rtt > 200) score -= 20;
      if (downlink < 5) score -= 20;
      if (downlink < 1) score -= 30;
      return Math.max(0, score);
  }

  private analyzeQuality(download: number, upload: number, ping: number, jitter: number, netInfo: any) {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Speed Analysis
      if (download < 5) {
          score -= 30;
          issues.push('Velocidade de download muito baixa');
          recommendations.push('Feche outros aplicativos que consomem banda');
      } else if (download < 15) {
          score -= 10;
          issues.push('Velocidade de download moderada');
      }

      // Latency Analysis
      if (ping > 100) {
          score -= 20;
          issues.push('Latência (Ping) alta');
          recommendations.push('Seproxime do roteador WiFi ou use cabo de rede');
      }
      
      if (jitter > 30) {
          score -= 15;
          issues.push('Conexão instável (Jitter alto)');
          recommendations.push('Verifique se há interferência na rede');
      }

      // Connection Type Analysis
      if (netInfo.effectiveType === '2g' || netInfo.effectiveType === 'slow-2g') {
          score -= 40;
          issues.push('Conexão móvel muito lenta detectada');
          recommendations.push('Tente conectar a uma rede WiFi');
      }

      let rating: 'Excelente' | 'Bom' | 'Regular' | 'Ruim' | 'Crítico' = 'Excelente';
      if (score < 30) rating = 'Crítico';
      else if (score < 50) rating = 'Ruim';
      else if (score < 70) rating = 'Regular';
      else if (score < 90) rating = 'Bom';

      return { score, rating, issues, recommendations };
  }

  private async checkExternalServices() {
    const services = [
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'Netflix', url: 'https://www.netflix.com' },
        { name: 'Facebook', url: 'https://www.facebook.com' }
    ];
    
    const results = await Promise.all(services.map(async (s) => {
        try {
            // Use our server-side proxy to avoid CORS issues
            const res = await fetch(`/api/diagnostics/external-check?url=${encodeURIComponent(s.url)}`);
            if (!res.ok) throw new Error('Check failed');
            const data = await res.json();
            return { name: s.name, status: data.status, latency: data.latency };
        } catch {
            return { name: s.name, status: 'down', latency: 0 };
        }
    }));
    return JSON.stringify(results);
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if(ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if(ua.indexOf("Safari") > -1) browser = "Safari";
    else if(ua.indexOf("Firefox") > -1) browser = "Firefox";

    let os = "Unknown";
    if(ua.indexOf("Win") > -1) os = "Windows";
    else if(ua.indexOf("Mac") > -1) os = "MacOS";
    else if(ua.indexOf("Linux") > -1) os = "Linux";
    else if(ua.indexOf("Android") > -1) os = "Android";
    else if(ua.indexOf("like Mac") > -1) os = "iOS";

    let gpu = "Unknown";
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
    } catch(e) {}

    return {
      userAgent: ua,
      os,
      browser,
      deviceMemory: (navigator as any).deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      gpu
    };
  }

  private async getPublicIp(): Promise<string> {
    try {
      const res = await fetch('/api/ip');
      const data = await res.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  }

  private async measureLatency() {
    const pings: number[] = [];
    for(let i=0; i<10; i++) {
      const start = performance.now();
      await fetch('/api/ip', { cache: 'no-store' }); 
      const end = performance.now();
      pings.push(end - start);
    }
    const min = Math.min(...pings);
    
    const jitter = pings.reduce((acc, curr, i) => {
        if (i === 0) return 0;
        return acc + Math.abs(curr - pings[i-1]);
    }, 0) / (pings.length - 1);
    
    return { ping: min, jitter };
  }

  private async measureDownloadSpeed(): Promise<number> {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/speedtest/download');
      
      if (!response.body) return 0;
      
      const reader = response.body.getReader();
      let receivedLength = 0;

      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        receivedLength += value.length;
      }
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; 
      if (duration <= 0) return 0;
      
      const bitsLoaded = receivedLength * 8;
      const bps = bitsLoaded / duration;
      return bps / (1024 * 1024); 
    } catch (e) {
      console.error('Download test error:', e);
      return 0;
    }
  }

  private async measureUploadSpeed(): Promise<number> {
    try {
      const size = 5 * 1024 * 1024;
      const buffer = new Uint8Array(size);
      const startTime = performance.now();
      
      const res = await fetch('/api/speedtest/upload', {
          method: 'POST',
          body: buffer
      });
      
      if (!res.ok) throw new Error('Upload failed');

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      if (duration <= 0) return 0;

      const bits = size * 8;
      return (bits / duration) / (1024 * 1024);
    } catch (e) {
      console.error('Upload test error:', e);
      return 0;
    }
  }
}
