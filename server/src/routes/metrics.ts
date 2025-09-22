import express from 'express';
import { getMetrics, type TimeRange } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get system metrics
router.get('/system', authenticateToken, async (req, res) => {
  try {
    const duration = (req.query.duration || '1h') as TimeRange;
    const metrics = await getMetrics(duration);
    res.json(metrics);
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
    const metrics = await getMetrics(duration);

    if (metrics.length === 0) {
      return res.json({
        avg_cpu: 0,
        avg_memory: 0,
        max_cpu: 0,
        max_memory: 0,
        min_cpu: 0,
        min_memory: 0,
      });
    }

    const stats = {
      avg_cpu: metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / metrics.length,
      avg_memory: metrics.reduce((sum, m) => sum + m.memory_usage, 0) / metrics.length,
      max_cpu: Math.max(...metrics.map(m => m.cpu_usage)),
      max_memory: Math.max(...metrics.map(m => m.memory_usage)),
      min_cpu: Math.min(...metrics.map(m => m.cpu_usage)),
      min_memory: Math.min(...metrics.map(m => m.memory_usage)),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;