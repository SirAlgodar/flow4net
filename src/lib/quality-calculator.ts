
export interface NetworkMetrics {
  latency: number; // ms
  jitter: number; // ms
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  packetLoss?: number; // % (0-100)
  rssi?: number; // dBm (e.g., -55)
}

export interface QoEResult {
  score: number; // 0-100
  rating: 'Excelente' | 'Bom' | 'Regular' | 'Ruim';
  color: string; // hex or tailwind class
  breakdown: {
    latencyScore: number;
    jitterScore: number;
    speedScore: number;
    signalScore?: number;
  };
}

/**
 * Calculates a Quality of Experience (QoE) score (0-100) based on network metrics.
 * Weights are adjusted based on available data.
 */
export function calculateQoE(metrics: NetworkMetrics): QoEResult {
  // Normalize metrics to 0-100 scores

  // 1. Latency (Lower is better)
  // < 20ms = 100, > 300ms = 0
  const latencyScore = Math.max(0, Math.min(100, 100 - ((metrics.latency - 20) / (300 - 20)) * 100));

  // 2. Jitter (Lower is better)
  // < 2ms = 100, > 30ms = 0
  const jitterScore = Math.max(0, Math.min(100, 100 - ((metrics.jitter - 2) / (30 - 2)) * 100));

  // 3. Speed (Download & Upload) - Higher is better
  // Download: > 100 Mbps = 100, < 1 Mbps = 0
  const downloadScore = Math.max(0, Math.min(100, (metrics.downloadSpeed / 100) * 100));
  
  // Upload: > 50 Mbps = 100, < 1 Mbps = 0
  const uploadScore = Math.max(0, Math.min(100, (metrics.uploadSpeed / 50) * 100));
  
  const speedScore = (downloadScore * 0.6) + (uploadScore * 0.4);

  // 4. Packet Loss (Lower is better)
  // 0% = 100, > 5% = 0
  const packetLossVal = metrics.packetLoss || 0;
  const packetLossScore = Math.max(0, Math.min(100, 100 - (packetLossVal / 5) * 100));

  // 5. RSSI (Signal Strength) - Optional
  // > -50 dBm = 100, < -90 dBm = 0
  let signalScore = 0;
  let hasSignal = false;
  if (metrics.rssi && metrics.rssi < 0) {
    hasSignal = true;
    signalScore = Math.max(0, Math.min(100, ((metrics.rssi + 90) / 40) * 100));
  }

  // Calculate Weighted Average
  let totalScore = 0;
  
  if (hasSignal) {
    // Scenario with RSSI (e.g. Native App or Local Server)
    // Latency: 25%, Jitter: 15%, Speed: 30%, Loss: 10%, Signal: 20%
    totalScore = (latencyScore * 0.25) + (jitterScore * 0.15) + (speedScore * 0.30) + (packetLossScore * 0.10) + (signalScore * 0.20);
  } else {
    // Scenario without RSSI (Web Browser)
    // Latency: 35%, Jitter: 20%, Speed: 35%, Loss: 10%
    totalScore = (latencyScore * 0.35) + (jitterScore * 0.20) + (speedScore * 0.35) + (packetLossScore * 0.10);
  }

  const roundedScore = Math.round(totalScore);

  let rating: QoEResult['rating'] = 'Ruim';
  let color = 'text-red-500';

  if (roundedScore >= 80) {
    rating = 'Excelente';
    color = 'text-green-500';
  } else if (roundedScore >= 60) {
    rating = 'Bom';
    color = 'text-yellow-500';
  } else if (roundedScore >= 40) {
    rating = 'Regular';
    color = 'text-orange-500';
  }

  return {
    score: roundedScore,
    rating,
    color,
    breakdown: {
      latencyScore: Math.round(latencyScore),
      jitterScore: Math.round(jitterScore),
      speedScore: Math.round(speedScore),
      signalScore: hasSignal ? Math.round(signalScore) : undefined
    }
  };
}
