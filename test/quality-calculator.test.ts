
import { calculateQoE, NetworkMetrics } from '../src/lib/quality-calculator';

describe('Quality Calculator (QoE)', () => {
  // 1. Normal/Excellent Connection (Native App with RSSI)
  test('should return Excellent rating for perfect metrics with RSSI', () => {
    const metrics: NetworkMetrics = {
      latency: 20, // 100%
      jitter: 2,   // 100%
      downloadSpeed: 100, // 100%
      uploadSpeed: 50,    // 100%
      packetLoss: 0,      // 100%
      rssi: -50           // 100%
    };

    const result = calculateQoE(metrics);
    
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.rating).toBe('Excelente');
    expect(result.breakdown.signalScore).toBeDefined();
    expect(result.breakdown.signalScore).toBeGreaterThan(90);
  });

  // 2. Normal/Excellent Connection (Web Browser - No RSSI)
  test('should return Excellent rating for perfect metrics without RSSI', () => {
    const metrics: NetworkMetrics = {
      latency: 20,
      jitter: 2,
      downloadSpeed: 100,
      uploadSpeed: 50,
      packetLoss: 0
      // No RSSI
    };

    const result = calculateQoE(metrics);
    
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.rating).toBe('Excelente');
    expect(result.breakdown.signalScore).toBeUndefined();
  });

  // 3. Weak Signal Scenario (Native App)
  test('should penalize score for weak signal', () => {
    const metrics: NetworkMetrics = {
      latency: 50,  // Goodish
      jitter: 5,    // Goodish
      downloadSpeed: 50, // Goodish
      uploadSpeed: 20,   // Goodish
      packetLoss: 0,
      rssi: -85     // Very Weak (~12% score)
    };

    const result = calculateQoE(metrics);
    
    // Signal weight is 20%. A low signal score should pull down the total significantly.
    // Let's approximate: 
    // Latency ~90 * 0.25 = 22.5
    // Jitter ~90 * 0.15 = 13.5
    // Speed ~50 * 0.30 = 15
    // Loss 100 * 0.10 = 10
    // Signal ~12 * 0.20 = 2.4
    // Total ~ 63.4 -> Bom/Regular border
    
    expect(result.score).toBeLessThan(80); // Should not be Excellent
    expect(result.breakdown.signalScore).toBeLessThan(30);
  });

  // 4. Unstable Connection (High Jitter/Packet Loss)
  test('should penalize score for instability (high jitter/loss)', () => {
    const metrics: NetworkMetrics = {
      latency: 100, // ~71%
      jitter: 50,   // > 30ms -> 0%
      downloadSpeed: 50,
      uploadSpeed: 10,
      packetLoss: 10, // > 5% -> 0%
      rssi: -60
    };

    const result = calculateQoE(metrics);

    expect(result.breakdown.jitterScore).toBe(0);
    expect(result.breakdown.latencyScore).toBeLessThan(80);
    expect(result.rating).not.toBe('Excelente');
  });

  // 5. High Latency (Satellite/VPN)
  test('should handle high latency gracefully', () => {
    const metrics: NetworkMetrics = {
      latency: 500, // > 300ms -> 0%
      jitter: 5,
      downloadSpeed: 100,
      uploadSpeed: 50,
      packetLoss: 0,
      rssi: -50
    };

    const result = calculateQoE(metrics);

    expect(result.breakdown.latencyScore).toBe(0);
    expect(result.score).toBeLessThan(80); // Latency has high weight (25-35%)
  });

  // 6. Extreme Case: Disconnected/Very Bad
  test('should return Ruim for all bad metrics', () => {
    const metrics: NetworkMetrics = {
      latency: 1000,
      jitter: 100,
      downloadSpeed: 0.1,
      uploadSpeed: 0.1,
      packetLoss: 20,
      rssi: -95
    };

    const result = calculateQoE(metrics);

    expect(result.score).toBeLessThan(20);
    expect(result.rating).toBe('Ruim');
    expect(result.color).toContain('red');
  });

  // 7. Edge Case: Boundary Values
  test('should handle boundary values correctly', () => {
    const metrics: NetworkMetrics = {
      latency: 300, // 0%
      jitter: 30,   // 0%
      downloadSpeed: 0, // 0%
      uploadSpeed: 0,   // 0%
      packetLoss: 5,    // 0%
      rssi: -90         // 0%
    };

    const result = calculateQoE(metrics);
    expect(result.score).toBe(0);
  });
});
