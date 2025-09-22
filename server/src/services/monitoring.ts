import si from 'systeminformation';
import cron from 'node-cron';
import { saveMetrics, cleanOldMetrics } from '../db/database.js';
import process from 'node:process';
import type { SystemMetrics } from '../types/index.js';

interface NetworkStats {
  rx_bytes: number;
  tx_bytes: number;
  timestamp: number;
}

let previousNetworkStats: NetworkStats | null = null;

async function collectSystemMetrics(): Promise<void> {
  try {
    // Get CPU usage
    const cpuData = await si.currentLoad();

    // Get memory info
    const memData = await si.mem();

    // Get process info
    const processData = await si.processes();

    // Get network stats
    const networkData = await si.networkStats();

    // Get disk usage
    const diskData = await si.fsSize();

    // Calculate network rates
    let networkRx = 0;
    let networkTx = 0;

    if (networkData && networkData.length > 0) {
      const currentStats: NetworkStats = {
        rx_bytes: networkData[0].rx_bytes,
        tx_bytes: networkData[0].tx_bytes,
        timestamp: Date.now()
      };

      if (previousNetworkStats) {
        const timeDiff = (currentStats.timestamp - previousNetworkStats.timestamp) / 1000; // seconds
        networkRx = (currentStats.rx_bytes - previousNetworkStats.rx_bytes) / timeDiff;
        networkTx = (currentStats.tx_bytes - previousNetworkStats.tx_bytes) / timeDiff;
      }

      previousNetworkStats = currentStats;
    }

    // Calculate disk usage percentage
    let diskUsage = 0;
    let diskTotal = 0;

    if (diskData && diskData.length > 0) {
      const mainDisk = diskData[0];
      diskUsage = (mainDisk.used / mainDisk.size) * 100;
      diskTotal = mainDisk.size / (1024 ** 3); // Convert to GB
    }

    // Find our process
    const ourProcess = processData.list.find(p => p.pid === process.pid);

    const metrics: SystemMetrics = {
      cpu_usage: cpuData.currentLoad,
      memory_usage: (memData.used / memData.total) * 100,
      memory_total: memData.total / (1024 ** 3), // Convert to GB
      memory_free: memData.free / (1024 ** 3),
      swap_usage: memData.swaptotal > 0 ? (memData.swapused / memData.swaptotal) * 100 : 0,
      swap_total: memData.swaptotal / (1024 ** 3),
      swap_free: memData.swapfree / (1024 ** 3),
      process_cpu: ourProcess ? ourProcess.cpu : 0,
      process_memory: ourProcess ? ourProcess.mem : 0,
      network_rx: Math.max(0, networkRx),
      network_tx: Math.max(0, networkTx),
      disk_usage: diskUsage,
      disk_total: diskTotal
    };

    await saveMetrics(metrics);
  } catch (error) {
    console.error('Error collecting metrics:', error);
  }
}

export function startMonitoring(): void {
  console.log('Starting system monitoring...');

  // Collect metrics immediately
  collectSystemMetrics();

  // Schedule metrics collection every 10 seconds
  cron.schedule('*/10 * * * * *', () => {
    collectSystemMetrics();
  });

  // Clean old metrics daily at 2 AM
  cron.schedule('0 2 * * *', () => {
    cleanOldMetrics().catch(console.error);
  });
}