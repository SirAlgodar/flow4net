
export enum Platform {
  Windows = 'Windows',
  MacOS = 'MacOS',
  Linux = 'Linux',
  Android = 'Android',
  iOS = 'iOS',
  Unknown = 'Unknown'
}

export function detectPlatform(userAgent: string): Platform {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('android')) return Platform.Android;
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return Platform.iOS;
  if (ua.includes('mac') || ua.includes('darwin')) return Platform.MacOS;
  if (ua.includes('win')) return Platform.Windows;
  if (ua.includes('linux')) return Platform.Linux;

  return Platform.Unknown;
}

export function getPlatformSpecificConfig(platform: Platform) {
  switch (platform) {
    case Platform.Android:
    case Platform.iOS:
      return {
        testDuration: 10000, // 10s for mobile (battery saving)
        downloadChunkSize: 512 * 1024, // 512KB chunks
        uploadChunkSize: 256 * 1024, // 256KB chunks
        threads: 2, // Fewer threads on mobile
        description: 'Mobile Optimized Test'
      };
    case Platform.MacOS:
    case Platform.Windows:
    case Platform.Linux:
      return {
        testDuration: 15000, // 15s for desktop
        downloadChunkSize: 1024 * 1024, // 1MB chunks
        uploadChunkSize: 512 * 1024, // 512KB chunks
        threads: 4, // More threads on desktop
        description: 'Desktop Optimized Test'
      };
    default:
      return {
        testDuration: 10000,
        downloadChunkSize: 512 * 1024,
        uploadChunkSize: 256 * 1024,
        threads: 2,
        description: 'Standard Test'
      };
  }
}
