import type { SystemMetrics } from '../types/index.js';

// In-memory storage for metrics
const memoryStorage: SystemMetrics[] = [];
const MAX_MEMORY_RECORDS = 10000; // Keep last 10k records in memory

export function saveMetrics(metrics: SystemMetrics): Promise<number> {
  // Save to memory storage
  const metricsWithTimestamp = {
    ...metrics,
    timestamp: new Date().toISOString(),
    id: memoryStorage.length + 1
  };
  memoryStorage.push(metricsWithTimestamp as any);

  // Keep only last MAX_MEMORY_RECORDS
  if (memoryStorage.length > MAX_MEMORY_RECORDS) {
    memoryStorage.splice(0, memoryStorage.length - MAX_MEMORY_RECORDS);
  }

  return Promise.resolve(metricsWithTimestamp.id);
}

export type TimeRange = '1m' | '5m' | '1h' | '1d' | '1w' | '1M' | '1y';

export function getMetrics(duration: TimeRange): Promise<SystemMetrics[]> {
  // Get from memory storage
  const now = new Date();
  let cutoffTime = new Date();

  switch(duration) {
    case '1m':
      cutoffTime.setMinutes(now.getMinutes() - 1);
      break;
    case '5m':
      cutoffTime.setMinutes(now.getMinutes() - 5);
      break;
    case '1h':
      cutoffTime.setHours(now.getHours() - 1);
      break;
    case '1d':
      cutoffTime.setDate(now.getDate() - 1);
      break;
    case '1w':
      cutoffTime.setDate(now.getDate() - 7);
      break;
    case '1M':
      cutoffTime.setMonth(now.getMonth() - 1);
      break;
    case '1y':
      cutoffTime.setFullYear(now.getFullYear() - 1);
      break;
    default:
      cutoffTime.setHours(now.getHours() - 1);
  }

  const filtered = memoryStorage.filter((m: any) => {
    const timestamp = new Date(m.timestamp);
    return timestamp >= cutoffTime;
  });

  // Return sorted by timestamp desc
  return Promise.resolve(filtered.sort((a: any, b: any) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 1000));
}

export function cleanOldMetrics(): Promise<number> {
  // Clean old metrics from memory (keep last 24 hours)
  const cutoffTime = new Date();
  cutoffTime.setDate(cutoffTime.getDate() - 1);

  const beforeLength = memoryStorage.length;
  const filtered = memoryStorage.filter((m: any) => {
    const timestamp = new Date(m.timestamp);
    return timestamp >= cutoffTime;
  });

  memoryStorage.length = 0;
  memoryStorage.push(...filtered);

  const removed = beforeLength - memoryStorage.length;
  console.log(`Cleaned ${removed} old metric records from memory`);
  return Promise.resolve(removed);
}

// Export null as default since we're not using a database
const db = null;
export default db;
export const dbAvailable = false;