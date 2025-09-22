import express from 'express';
import { getMetrics, type TimeRange } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { metricsAggregator } from '../services/metricsAggregator.js';

const router = express.Router();

// Get system metrics (with aggregation for longer time ranges)
router.get('/system', authenticateToken, async (req, res) => {
  try {
    const duration = (req.query.duration || '1h') as TimeRange;

    // Use aggregated data for longer time ranges
    if (['1d', '1w', '1M', '1y'].includes(duration)) {
      const metrics = await metricsAggregator.getAggregatedMetrics(duration);
      res.json(metrics);
    } else {
      // Use raw data for short time ranges
      const metrics = await getMetrics(duration);
      res.json(metrics);
    }
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get current system stats (latest metrics)
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const metrics = await getMetrics('1m');
    const latest = metrics[0] || null;
    res.json(latest);
  } catch (error) {
    console.error('Error fetching current metrics:', error);
    res.status(500).json({ error: 'Failed to fetch current metrics' });
  }
});

// Get aggregated stats for a time range
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const duration = (req.query.duration || '1h') as TimeRange;

    // Use aggregated stats for longer time ranges
    if (['1d', '1w', '1M', '1y'].includes(duration)) {
      const stats = await metricsAggregator.getMetricsStats(duration);
      if (!stats) {
        return res.json({
          avg_cpu: 0,
          avg_memory: 0,
          max_cpu: 0,
          max_memory: 0,
          min_cpu: 0,
          min_memory: 0,
          total_network_rx: 0,
          total_network_tx: 0,
        });
      }
      res.json(stats);
    } else {
      // Use raw data for short time ranges
      const metrics = await getMetrics(duration);

      if (metrics.length === 0) {
        return res.json({
          avg_cpu: 0,
          avg_memory: 0,
          max_cpu: 0,
          max_memory: 0,
          min_cpu: 0,
          min_memory: 0,
          total_network_rx: 0,
          total_network_tx: 0,
        });
      }

      const stats = {
        avg_cpu: metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length,
        avg_memory: metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length,
        max_cpu: Math.max(...metrics.map(m => m.cpu_usage)),
        max_memory: Math.max(...metrics.map(m => m.memory_usage)),
        min_cpu: Math.min(...metrics.map(m => m.cpu_usage)),
        min_memory: Math.min(...metrics.map(m => m.memory_usage)),
        total_network_rx: metrics.reduce((sum, m) => sum + m.network_rx, 0),
        total_network_tx: metrics.reduce((sum, m) => sum + m.network_tx, 0),
      };

      res.json(stats);
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;