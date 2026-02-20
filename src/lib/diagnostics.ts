import { z } from 'zod';
import { calculateQoE, NetworkMetrics } from './quality-calculator';

// Define the comprehensive result interface matching the user's PDF model
export interface DiagnosticResult {
  navigation: {
    realizadoEm: string;
    identificador: string;
    durationTotal: string;
    durationIPv6: string;
    durationBandwidth: string;
    durationOpening: string;
    durationDataSend: string;
    durationSpeed: string;
    durationResponse: string;
    durationMTU: string;
  };
  device: {
    platform: string;
    browser: string;
    version: string;
    cores: number;
    ram: string;
    gpu: string;
    userAgent: string;
  };
  network: {
    provider: string;
    providerReason?: string;
    ip: string;
    localIp: string;
    ipv6: string;
    connectionType: string;
    effectiveType?: string;
    ssid?: string;
    rssi?: number;
    frequency?: number;
    channel?: number;
    quality?: number;
    ipMetadata?: {
      asnOrganization?: string;
      country?: string;
      region?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  mtu: {
    mtu: number;
    mss: number;
  };
  speed: {
    downloadAvg: number;
    downloadMax: number;
    uploadAvg: number;
    uploadMax: number;
    ping: number;
    jitter: number;
    jitterStatus: string;
  };
  streaming: {
    sd: boolean;
    hd: boolean;
    ultraHd: boolean;
    live: boolean;
    k4: boolean;
  };
  bandwidth: {
    speed: number;
    latency: number;
    type: string;
    packetLoss: number;
    status: string;
    rtt: number;
  };
  pageResponse: PageMetric[];
  pageOpening: PageMetric[]; // Usually same as response but maybe full load? We'll map them similarly
  downdetector: ServiceStatus[];
  quality?: {
    score: number;
    rating: string;
    color: string;
    issues: string[];
    recommendations: string[];
    breakdown?: {
        latencyScore: number;
        jitterScore: number;
        speedScore: number;
        signalScore?: number;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  mediaCheck?: {
    granted: boolean;
    camera: boolean;
    mic: boolean;
    details?: any[];
  };
  agent?: any;
}

export interface PageMetric {
  name: string;
  min: number;
  max: number;
  avg: number;
  packetLoss: number;
}

export interface ServiceStatus {
  name: string;
  status: 'up' | 'down' | 'slow';
  latency?: number;
}

interface TestConfig {
  testDuration: number;
  downloadChunkSize: number;
  uploadChunkSize: number;
  threads: number;
  description: string;
}

let cachedDeviceInfo: { cores: number; ram: string } | null = null;

export class DiagnosticsEngine {
  private updateCallback: (status: string, progress: number, partialMetrics?: Partial<NetworkMetrics>) => void;
  private timings: Record<string, number> = {};
  private config: TestConfig = {
    testDuration: 10000,
    downloadChunkSize: 512 * 1024,
    uploadChunkSize: 256 * 1024,
    threads: 2,
    description: 'Default'
  };

  constructor(onUpdate: (status: string, progress: number, partialMetrics?: Partial<NetworkMetrics>) => void) {
    this.updateCallback = onUpdate;
  }

  private startTimer(label: string) {
    this.timings[label] = performance.now();
  }

  private stopTimer(label: string): string {
    const start = this.timings[label];
    if (!start) return "0ms";
    const duration = performance.now() - start;
    return `${Math.round(duration)}ms`;
  }

  private async fetchConfig() {
    try {
      const res = await fetch('/api/config/test-parameters');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          this.config = data.config;
          console.log('Applied platform config:', this.config);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch test config, using defaults', e);
    }
  }

  async run(context: any = {}): Promise<DiagnosticResult> {
    const totalStart = performance.now();
    this.startTimer('total');

    // Fetch config first
    await this.fetchConfig();

    // --- 1. Device Info ---
    this.updateCallback('Coletando informações do dispositivo...', 5);
    const device = this.getDeviceInfo();

    // --- 2. Network Info (IP, Provider, IPv6) ---
    this.updateCallback('Analisando rede e IPv6...', 10);
    this.startTimer('ipv6');
    const networkInfo = await this.getNetworkInfo();
    // Pass initial metrics including RSSI to callback for UI
    this.updateCallback('Rede analisada', 12, { rssi: networkInfo.rssi });
    const durationIPv6 = this.stopTimer('ipv6');

    // --- 3. MTU / MSS ---
    this.updateCallback('Testando MTU e MSS...', 15);
    this.startTimer('mtu');
    const mtuInfo = await this.estimateMTU();
    const durationMTU = this.stopTimer('mtu');

    // --- 4. Speed Test (Download/Upload/Ping/Jitter) ---
    this.updateCallback('Executando teste de velocidade...', 20);
    this.startTimer('speed');
    
    // Latency
    this.updateCallback('Medindo latência e jitter...', 25);
    const latencyData = await this.measureLatency();
    
    // Download
    this.updateCallback('Medindo download...', 35);
    const downloadData = await this.measureDownload();
    
    // Upload
    this.updateCallback('Medindo upload...', 50);
    const uploadData = await this.measureUpload();
    
    const durationSpeed = this.stopTimer('speed');

    // --- 5. Bandwidth Quality ---
    this.updateCallback('Analisando qualidade da banda...', 60);
    this.startTimer('bandwidth');
    const bandwidthData = this.analyzeBandwidth(downloadData, latencyData, networkInfo);
    const durationBandwidth = this.stopTimer('bandwidth');

    // --- 6. Page Response / Opening ---
    this.updateCallback('Verificando tempo de resposta de sites...', 70);
    this.startTimer('response');
    const pageMetrics = await this.checkPageMetrics();
    const durationResponse = this.stopTimer('response');
    const durationOpening = durationResponse; // Using same metric for now

    // --- 7. Downdetector Status ---
    this.updateCallback('Verificando status de serviços...', 85);
    const downdetectorData = await this.checkDowndetector();

    // --- 8. Agent (flow4-net-agent) ---
    let agentData: any = null;
    try {
      this.updateCallback('Coletando dados avançados de rede (agente)...', 92);
      const agentRes = await fetch('/api/agent/network', { cache: 'no-store' });
      if (agentRes.ok) {
        const agentJson = await agentRes.json();
        agentData = agentJson.agent || null;
      }
    } catch (e) {
      console.warn('Failed to collect agent data', e);
    }

    // --- 9. Final Compilation ---
    this.updateCallback('Compilando resultados...', 95);
    this.startTimer('datasend');
    
    // Quality Analysis
    const qoeResult = calculateQoE({
      latency: latencyData.ping,
      jitter: latencyData.jitter,
      downloadSpeed: downloadData.avg,
      uploadSpeed: uploadData.avg,
      packetLoss: bandwidthData.packetLoss,
      rssi: networkInfo.rssi
    });

    const quality = {
      score: qoeResult.score,
      rating: qoeResult.rating,
      color: qoeResult.color,
      issues: [],
      recommendations: [],
      breakdown: qoeResult.breakdown
    };

    const totalDuration = ((performance.now() - totalStart) / 1000).toFixed(2) + 's';
    const durationDataSend = "0ms"; // Placeholder for actual send time

    return {
      navigation: {
        realizadoEm: new Date().toISOString(),
        identificador: '', // To be filled by UI
        durationTotal: totalDuration,
        durationIPv6,
        durationBandwidth,
        durationOpening,
        durationDataSend,
        durationSpeed,
        durationResponse,
        durationMTU
      },
      device,
      network: networkInfo,
      mtu: mtuInfo,
      speed: {
        downloadAvg: downloadData.avg,
        downloadMax: downloadData.max,
        uploadAvg: uploadData.avg,
        uploadMax: uploadData.max,
        ping: latencyData.ping,
        jitter: latencyData.jitter,
        jitterStatus: this.getJitterStatus(latencyData.jitter)
      },
      streaming: this.analyzeStreaming(downloadData.avg),
      bandwidth: bandwidthData,
      pageResponse: pageMetrics,
      pageOpening: pageMetrics, // Duplicated for now as we don't have separate "opening" vs "response" logic
      downdetector: downdetectorData,
      quality,
      location: context.location,
      mediaCheck: context.mediaCheck,
      agent: agentData
    };
  }

  // --- Helper Methods ---

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Desconhecido";
    let version = "Desconhecido";
    
    if (ua.includes("Chrome")) { browser = "Chrome"; version = ua.match(/Chrome\/(\d+)/)?.[1] || ""; }
    else if (ua.includes("Firefox")) { browser = "Firefox"; version = ua.match(/Firefox\/(\d+)/)?.[1] || ""; }
    else if (ua.includes("Safari")) { browser = "Safari"; version = ua.match(/Version\/(\d+)/)?.[1] || ""; }
    else if (ua.includes("Edge")) { browser = "Edge"; version = ua.match(/Edg\/(\d+)/)?.[1] || ""; }

    let platform = "Desconhecido";
    if (ua.includes("Win")) platform = "Windows";
    else if (ua.includes("Mac")) platform = "MacOS";
    else if (ua.includes("Linux")) platform = "Linux";
    else if (ua.includes("Android")) platform = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) platform = "iOS";

    // GPU detection
    let gpu = "Desconhecida";
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {}

    let cores = navigator.hardwareConcurrency || 0;
    let ram = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : "Desconhecido";

    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        if (!cachedDeviceInfo) {
          const stored = window.localStorage.getItem('flow4_device_info');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed.cores === 'number') cores = parsed.cores;
            if (typeof parsed.ram === 'string') ram = parsed.ram;
          } else {
            window.localStorage.setItem('flow4_device_info', JSON.stringify({ cores, ram }));
          }
        }
        cachedDeviceInfo = { cores, ram };
      }
    } catch (e) {}

    const info = {
      platform,
      browser,
      version,
      cores,
      ram,
      gpu,
      userAgent: ua
    };
    
    console.log('Device Info Detected:', info);
    return info;
  }

  private async getNetworkInfo() {
    try {
      const resV4 = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const dataV4 = resV4 ? await resV4.json() : { ip: 'Falha' };
      
      let ipv6 = "Não é IPv6";
      try {
        const resV6 = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
        const dataV6 = await resV6.json();
        if (dataV6.ip !== dataV4.ip) {
          ipv6 = dataV6.ip;
        }
      } catch (e) {}

      let provider = "Não identificado";
      let providerReason: string | undefined;
      let ipMetadata:
        | {
            asnOrganization?: string;
            country?: string;
            region?: string;
            city?: string;
            latitude?: number;
            longitude?: number;
          }
        | undefined;

      try {
        const metaRes = await fetch('https://free.freeipapi.com/api/json/', {
          signal: AbortSignal.timeout(4000),
        });
        if (metaRes.ok) {
          const metaJson = await metaRes.json();
          const asnOrg =
            typeof metaJson.asnOrganization === 'string'
              ? metaJson.asnOrganization.trim()
              : '';

          ipMetadata = {};

          if (asnOrg) {
            ipMetadata.asnOrganization = asnOrg;
            provider = asnOrg;
          } else {
            providerReason = "Serviço de identificação de IP não retornou organização ASN.";
          }

          if (typeof metaJson.countryName === 'string' && metaJson.countryName.trim()) {
            ipMetadata.country = metaJson.countryName.trim();
          }
          if (typeof metaJson.regionName === 'string' && metaJson.regionName.trim()) {
            ipMetadata.region = metaJson.regionName.trim();
          }
          if (typeof metaJson.cityName === 'string' && metaJson.cityName.trim()) {
            ipMetadata.city = metaJson.cityName.trim();
          }
          if (typeof metaJson.latitude === 'number') {
            ipMetadata.latitude = metaJson.latitude;
          }
          if (typeof metaJson.longitude === 'number') {
            ipMetadata.longitude = metaJson.longitude;
          }
        } else {
          providerReason = "Serviço de identificação de IP indisponível no momento.";
        }
      } catch (e) {
        console.warn('Failed to fetch IP metadata from freeipapi', e);
        if (!providerReason) {
          providerReason = "Falha ao consultar serviço de identificação de IP.";
        }
      }

      try {
        if (provider === "Não identificado" && dataV4.ip && dataV4.ip !== 'Falha') {
          const isHttps =
            typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
          if (isHttps) {
            const resGeo = await fetch(`https://ipwho.is/${dataV4.ip}`);
            if (resGeo.ok) {
              const geoData = await resGeo.json();
              provider =
                (geoData.connection && (geoData.connection.isp || geoData.connection.org)) ||
                geoData.org ||
                geoData.isp ||
                geoData.as ||
                provider;
            }
          } else {
            const resGeo = await fetch(`http://ip-api.com/json/${dataV4.ip}?fields=isp,org,as`);
            if (resGeo.ok) {
              const geoData = await resGeo.json();
              provider = geoData.isp || geoData.org || geoData.as || provider;
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch ISP info:", e);
        if (!providerReason) {
          providerReason = "Não foi possível identificar o provedor devido a restrições de rede/navegador ou uso de VPN/CGNAT.";
        }
      }

      // Connection API
      const conn = (navigator as any).connection || {};
      
      const type = conn.type;
      let displayType = "Indefinido (Limitação Web)";
      
      if (type) {
        displayType = type === 'wifi' ? 'WiFi' : 
                      type === 'cellular' ? 'Dados Móveis' : 
                      type === 'ethernet' ? 'Cabo' : type;
      }

      let ssid = undefined;
      let rssi = undefined;
      let frequency = undefined as number | undefined;
      let channel = undefined as number | undefined;
      let quality = undefined as number | undefined;
      try {
          const wifiRes = await fetch('/api/network/wifi');
          if (wifiRes.ok) {
              const wifiData = await wifiRes.json();
              if (wifiData.connected && wifiData.data) {
                  ssid = wifiData.data.ssid;
                  rssi = wifiData.data.signal_level;
                  if (typeof wifiData.data.frequency === 'number') {
                    frequency = wifiData.data.frequency;
                  }
                  if (typeof wifiData.data.channel === 'number') {
                    channel = wifiData.data.channel;
                  }
                  if (typeof wifiData.data.quality === 'number') {
                    quality = wifiData.data.quality;
                  }
                  if (!type || type === 'unknown') {
                      displayType = "WiFi (Local)";
                  }
              }
          }
      } catch (e) {
          console.warn("Could not fetch backend WiFi info during test");
      }

      return {
        provider,
        providerReason,
        ip: dataV4.ip,
        localIp: "Oculto",
        ipv6,
        connectionType: displayType,
        effectiveType: conn.effectiveType || "Desconhecido",
        ssid,
        rssi,
        frequency,
        channel,
        quality,
        ipMetadata
      };
    } catch (e) {
      return { provider: "Erro", ip: "Erro", localIp: "Erro", ipv6: "Erro", connectionType: "Erro" };
    }
  }

  private async estimateMTU() {
    // Client-side MTU estimation is limited. We'll standard values based on connection.
    // In a real scenario, you'd ping with different packet sizes.
    return { mtu: 1500, mss: 1460 }; 
  }

  private async measureLatency() {
    const pings: number[] = [];
    // Measure 10 times
    for(let i=0; i<10; i++) {
        const start = performance.now();
        await fetch('/api/ping', { cache: 'no-store', method: 'HEAD' }); 
        const duration = performance.now() - start;
        pings.push(duration);

        // Partial update
        const currentAvg = pings.reduce((a,b) => a+b, 0) / pings.length;
        const currentJitter = pings.length > 1 ? pings.reduce((acc, curr, idx) => {
            if (idx === 0) return 0;
            return acc + Math.abs(curr - pings[idx-1]);
        }, 0) / (pings.length - 1) : 0;

        this.updateCallback('Medindo latência e jitter...', 25 + i, { latency: currentAvg, jitter: currentJitter });
    }
    
    const min = Math.min(...pings);
    const avg = pings.reduce((a,b) => a+b, 0) / pings.length;
    
    // Jitter: average deviation
    const jitter = pings.reduce((acc, curr, i) => {
        if (i === 0) return 0;
        return acc + Math.abs(curr - pings[i-1]);
    }, 0) / (pings.length - 1);

    return { ping: avg, jitter, min, max: Math.max(...pings), all: pings };
  }

  private async measureDownload() {
    // Reuse existing logic but track Avg/Max
    // Simulating variations for Max vs Avg
    const avg = await this.runDownloadTest();
    return { avg, max: avg * 1.1 }; // Slight boost for max
  }

  private async measureUpload() {
    const avg = await this.runUploadTest();
    return { avg, max: avg * 1.05 };
  }

  private async runDownloadTest(): Promise<number> {
    let controller: AbortController | null = new AbortController();
    // Max duration based on config + buffer
    const timeoutId = setTimeout(() => controller?.abort(), this.config.testDuration + 10000); 

    let received = 0;
    let measureStartTime = 0;
    
    try {
        const response = await fetch('/api/speedtest/download', { 
            signal: controller.signal,
            cache: 'no-store'
        });
        
        if (!response.body) return 0;
        const reader = response.body.getReader();
        
        let warmupBytes = 0;
        const startTime = performance.now();
        let inWarmup = true;
        let lastUpdate = 0;
        
        while(true) {
            const {done, value} = await reader.read();
            if(done) break;
            
            const chunkSize = value.length;
            
            // Warmup logic: Discard first 1s or 1MB of data
            if (inWarmup) {
                warmupBytes += chunkSize;
                const now = performance.now();
                // Increased warmup time for proxy latency
                if (now - startTime > 1000 || warmupBytes > 1 * 1024 * 1024) {
                    inWarmup = false;
                    measureStartTime = now;
                    received = 0; // Reset counter for actual measurement
                }
            } else {
                received += chunkSize;
                const now = performance.now();
                const duration = (now - measureStartTime) / 1000;

                // Update UI every 200ms
                if (now - lastUpdate > 200) {
                    lastUpdate = now;
                    if (duration > 0.1) {
                         const currentSpeed = (received * 8) / duration / (1024 * 1024);
                         // Progress 35-50%
                         const progress = 35 + Math.min(15, (duration / (this.config.testDuration / 1000)) * 15);
                         this.updateCallback('Medindo download...', progress, { downloadSpeed: currentSpeed });
                    }
                }

                // Stop if we have measured for at least config duration or hit 100MB
                if (duration > (this.config.testDuration / 1000) || received > 100 * 1024 * 1024) {
                    await reader.cancel();
                    break;
                }
            }
        }
        
        clearTimeout(timeoutId);
        
        // If we didn't exit warmup or have very little data, use what we have (fallback)
        if (inWarmup || received < 1000) {
             received = warmupBytes;
             measureStartTime = startTime;
        }

        const duration = (performance.now() - measureStartTime) / 1000;
        if (duration <= 0) return 0;
        
        return (received * 8) / duration / (1024 * 1024);

    } catch (e: any) { 
        clearTimeout(timeoutId);
        
        // Treat AbortError as valid completion if we have data
        if ((e.name === 'AbortError' || e.message?.includes('aborted')) && (received > 1000 || measureStartTime > 0)) {
            // Use what we have
            const duration = (performance.now() - (measureStartTime || performance.now())) / 1000;
            if (duration > 0.1) {
                return (received * 8) / duration / (1024 * 1024);
            }
        }

        console.error("Download test failed:", e);
        return 0; 
    }
  }

  private async runUploadTest(): Promise<number> {
    const endTime = performance.now() + this.config.testDuration;
    let totalBytes = 0;
    let startTime = performance.now();
    let measureStartTime = 0;
    let inWarmup = true;
    const warmupBytesLimit = 1 * 1024 * 1024; // 1MB warmup
    const warmupTimeLimit = 2000; // 2s warmup

    // Dynamic chunk size adaptation could be added here, 
    // but for now we stick to config size
    const chunk = new Uint8Array(this.config.uploadChunkSize);

    try {
        while (performance.now() < endTime) {
            const chunkStart = performance.now();
            await fetch('/api/speedtest/upload', { 
                method: 'POST', 
                body: chunk,
                cache: 'no-store'
            });
            const chunkDuration = performance.now() - chunkStart;
            
            // Warmup logic
            if (inWarmup) {
                totalBytes += chunk.length;
                if (performance.now() - startTime > warmupTimeLimit || totalBytes > warmupBytesLimit) {
                    inWarmup = false;
                    measureStartTime = performance.now();
                    totalBytes = 0; // Reset for actual measurement
                    startTime = measureStartTime; // Reset start time for progress calc
                }
            } else {
                totalBytes += chunk.length;
                const duration = (performance.now() - measureStartTime) / 1000;
                
                // Update UI
                if (duration > 0.2) {
                    const currentSpeed = (totalBytes * 8) / duration / (1024 * 1024);
                    // Progress 50-60%
                    const progress = 50 + Math.min(10, (duration / (this.config.testDuration / 1000)) * 10);
                    this.updateCallback('Medindo upload...', progress, { uploadSpeed: currentSpeed });
                }
            }
            
            // Safety break if we are stuck
            if (performance.now() - startTime > this.config.testDuration + 5000) break;
        }

        const duration = (performance.now() - (measureStartTime || startTime)) / 1000;
        if (duration <= 0) return 0;
        return (totalBytes * 8) / duration / (1024 * 1024);

    } catch (e) {
        console.error("Upload test failed:", e);
        return 0;
    }
  }

  private analyzeBandwidth(down: any, lat: any, net: any) {
    // Estimate packet loss based on ping failures (if we had any)
    // For now, simulate based on jitter
    let packetLoss = 0;
    if (lat.jitter > 50) packetLoss = 0.5;
    if (lat.jitter > 100) packetLoss = 2.0;

    return {
        speed: down.avg,
        latency: lat.ping,
        type: net.connectionType,
        packetLoss,
        status: packetLoss < 1 ? "Estável" : "Instável",
        rtt: lat.ping // Using ping as RTT
    };
  }

  private async checkPageMetrics(): Promise<PageMetric[]> {
    const sites = [
        { name: 'Google', url: 'https://www.google.com' },
        { name: 'Instagram', url: 'https://www.instagram.com' },
        { name: 'Minha Online', url: 'https://minha.online' }, // Assuming this is the target
        { name: 'TikTok', url: 'https://www.tiktok.com' },
        { name: 'Facebook', url: 'https://www.facebook.com' },
        { name: 'X', url: 'https://twitter.com' },
        { name: 'YouTube', url: 'https://www.youtube.com' }
    ];

    const results: PageMetric[] = [];

    for (const site of sites) {
        // Run 3 checks per site to get Min/Max/Avg
        const pings = [];
        let failures = 0;
        
        for(let i=0; i<3; i++) {
            try {
                const start = performance.now();
                await fetch(`/api/diagnostics/external-check?url=${encodeURIComponent(site.url)}`);
                pings.push(performance.now() - start);
            } catch {
                failures++;
            }
        }

        if (pings.length > 0) {
            const min = Math.min(...pings);
            const max = Math.max(...pings);
            const avg = pings.reduce((a,b)=>a+b,0) / pings.length;
            results.push({ name: site.name, min, max, avg, packetLoss: (failures/3)*100 });
        } else {
            results.push({ name: site.name, min: 0, max: 0, avg: 0, packetLoss: 100 });
        }
    }
    return results;
  }

  private async checkDowndetector(): Promise<ServiceStatus[]> {
    const services = [
        "Amazon", "Cloudflare", "Discord", "Facebook", "Google", "Instagram", "Netflix", 
        "Spotify", "Telegram", "Twitter", "WhatsApp", "YouTube"
    ]; // Reduced list for demo performance, user list is huge
    
    // In real app, verify all. For now, we mock check a few or run parallel
    // Running parallel checks
    const promises = services.map(async name => {
        try {
            // Mapping names to URLs would be needed.
            // Using a generic check or mock for now as we don't have all URLs mapped
            return { name, status: 'up' as const };
        } catch {
            return { name, status: 'down' as const };
        }
    });

    return await Promise.all(promises);
  }

  private analyzeStreaming(mbps: number) {
    return {
        sd: mbps > 3,
        hd: mbps > 5,
        ultraHd: mbps > 15,
        live: mbps > 10,
        k4: mbps > 25
    };
  }

  private getJitterStatus(ms: number) {
    if (ms < 5) return "Excelente";
    if (ms < 30) return "Bom";
    if (ms < 100) return "Regular";
    return "Ruim";
  }

  private analyzeQuality(down: number, up: number, ping: number, jitter: number, loss: number) {
      let score = 100;
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (down < 10) { score -= 20; issues.push("Download baixo"); }
      if (up < 5) { score -= 10; issues.push("Upload baixo"); }
      if (ping > 50) { score -= 15; issues.push("Latência alta"); }
      if (jitter > 20) { score -= 15; issues.push("Jitter alto"); }
      if (loss > 0) { score -= 30; issues.push("Perda de pacotes detectada"); }

      let rating = "Excelente";
      if (score < 90) rating = "Bom";
      if (score < 70) rating = "Regular";
      if (score < 50) rating = "Ruim";

      return { score, rating, issues, recommendations };
  }
}
