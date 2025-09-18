import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/metrics.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS system_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      cpu_usage REAL,
      memory_usage REAL,
      memory_total REAL,
      memory_free REAL,
      process_cpu REAL,
      process_memory REAL,
      network_rx REAL,
      network_tx REAL,
      disk_usage REAL,
      disk_total REAL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('System metrics table ready');

      // Create index for faster queries
      db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON system_metrics(timestamp DESC)`);
    }
  });
}

export function saveMetrics(metrics) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO system_metrics (
        cpu_usage, memory_usage, memory_total, memory_free,
        process_cpu, process_memory, network_rx, network_tx,
        disk_usage, disk_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      metrics.cpu_usage,
      metrics.memory_usage,
      metrics.memory_total,
      metrics.memory_free,
      metrics.process_cpu,
      metrics.process_memory,
      metrics.network_rx || 0,
      metrics.network_tx || 0,
      metrics.disk_usage || 0,
      metrics.disk_total || 0
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

export function getMetrics(duration) {
  return new Promise((resolve, reject) => {
    let whereClause = '';
    const now = new Date();

    switch(duration) {
      case '1m':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 minute')";
        break;
      case '5m':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-5 minutes')";
        break;
      case '1h':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 hour')";
        break;
      case '1d':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 day')";
        break;
      case '1w':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-7 days')";
        break;
      case '1M':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 month')";
        break;
      case '1y':
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 year')";
        break;
      default:
        whereClause = "WHERE datetime(timestamp) >= datetime('now', '-1 hour')";
    }

    // Aggregate data based on duration
    let groupBy = '';
    if (duration === '1d' || duration === '1w') {
      groupBy = ", strftime('%Y-%m-%d %H:00:00', timestamp) as time_bucket GROUP BY time_bucket";
    } else if (duration === '1M') {
      groupBy = ", strftime('%Y-%m-%d', timestamp) as time_bucket GROUP BY time_bucket";
    } else if (duration === '1y') {
      groupBy = ", strftime('%Y-%m-%d', timestamp) as time_bucket GROUP BY time_bucket";
    }

    const sql = groupBy ? `
      SELECT
        time_bucket as timestamp,
        AVG(cpu_usage) as cpu_usage,
        AVG(memory_usage) as memory_usage,
        AVG(memory_total) as memory_total,
        AVG(memory_free) as memory_free,
        AVG(process_cpu) as process_cpu,
        AVG(process_memory) as process_memory,
        AVG(network_rx) as network_rx,
        AVG(network_tx) as network_tx,
        AVG(disk_usage) as disk_usage,
        AVG(disk_total) as disk_total
      FROM system_metrics
      ${whereClause}
      ${groupBy}
      ORDER BY timestamp DESC
      LIMIT 1000
    ` : `
      SELECT * FROM system_metrics
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT 1000
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function cleanOldMetrics() {
  return new Promise((resolve, reject) => {
    // Keep only last 1 year of data
    const sql = "DELETE FROM system_metrics WHERE datetime(timestamp) < datetime('now', '-1 year')";

    db.run(sql, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`Cleaned ${this.changes} old metric records`);
        resolve(this.changes);
      }
    });
  });
}

export default db;