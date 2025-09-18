import si from 'systeminformation';
import cron from 'node-cron';
import { saveMetrics, cleanOldMetrics } from '../db/database.js';
import process from 'process';

let previousNetworkStats = null;

async function collectSystemMetrics() {
  try {
    // Get CPU usage
    const cpuData = await si.currentLoad();

    // Get memory information
    const memData = await si.mem();

    // Get process information
    const processData = process.cpuUsage();
    const processMemory = process.memoryUsage();

    // Get network stats
    const networkStats = await si.networkStats();

    // Get disk usage
    const diskData = await si.fsSize();

    // Calculate network traffic
    let networkRx = 0;
    let networkTx = 0;

    if (networkStats && networkStats.length > 0) {
      const mainInterface = networkStats[0];
      if (previousNetworkStats) {
        networkRx = mainInterface.rx_bytes - previousNetworkStats.rx_bytes;
        networkTx = mainInterface.tx_bytes - previousNetworkStats.tx_bytes;
      }
      previousNetworkStats = {
        rx_bytes: mainInterface.rx_bytes,
        tx_bytes: mainInterface.tx_bytes
      };
    }

    // Calculate disk usage for main drive
    let diskUsage = 0;
    let diskTotal = 0;

    if (diskData && diskData.length > 0) {
      const mainDisk = diskData[0];
      diskUsage = (mainDisk.used / mainDisk.size) * 100;
      diskTotal = mainDisk.size;
    }

    const metrics = {
      cpu_usage: cpuData.currentLoad || 0,
      memory_usage: ((memData.used / memData.total) * 100) || 0,
      memory_total: memData.total || 0,
      memory_free: memData.free || 0,
      process_cpu: (processData.user + processData.system) / 1000000 || 0, // Convert to seconds
      process_memory: processMemory.heapUsed || 0,
      network_rx: networkRx,
      network_tx: networkTx,
      disk_usage: diskUsage,
      disk_total: diskTotal
    };

    await saveMetrics(metrics);
    console.log('Metrics collected:', new Date().toISOString());

    return metrics;
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return null;
  }
}

// Start monitoring
export function startMonitoring() {
  console.log('Starting system monitoring...');

  // Collect metrics immediately
  collectSystemMetrics();

  // Schedule metric collection every minute
  cron.schedule('* * * * *', () => {
    collectSystemMetrics();
  });

  // Clean old metrics once a day at midnight
  cron.schedule('0 0 * * *', () => {
    cleanOldMetrics().catch(console.error);
  });
}

// Get current metrics
export async function getCurrentMetrics() {
  return collectSystemMetrics();
}

export default {
  startMonitoring,
  getCurrentMetrics
};