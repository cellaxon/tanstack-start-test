import express from 'express';
import { getMetrics } from '../db/database.js';
import { getCurrentMetrics } from '../services/monitoring.js';

const router = express.Router();

// Get historical metrics
router.get('/history', async (req, res) => {
  try {
    const { duration = '1h' } = req.query;
    const metrics = await getMetrics(duration);
    res.json({
      success: true,
      data: metrics,
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
});

// Get current metrics
router.get('/current', async (req, res) => {
  try {
    const metrics = await getCurrentMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching current metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current metrics'
    });
  }
});

// Get aggregated statistics
router.get('/stats', async (req, res) => {
  try {
    const { duration = '1h' } = req.query;
    const metrics = await getMetrics(duration);

    if (metrics.length === 0) {
      return res.json({
        success: true,
        data: {
          avg_cpu: 0,
          max_cpu: 0,
          min_cpu: 0,
          avg_memory: 0,
          max_memory: 0,
          min_memory: 0,
          total_network_rx: 0,
          total_network_tx: 0
        }
      });
    }

    const stats = {
      avg_cpu: metrics.reduce((acc, m) => acc + m.cpu_usage, 0) / metrics.length,
      max_cpu: Math.max(...metrics.map(m => m.cpu_usage)),
      min_cpu: Math.min(...metrics.map(m => m.cpu_usage)),
      avg_memory: metrics.reduce((acc, m) => acc + m.memory_usage, 0) / metrics.length,
      max_memory: Math.max(...metrics.map(m => m.memory_usage)),
      min_memory: Math.min(...metrics.map(m => m.memory_usage)),
      total_network_rx: metrics.reduce((acc, m) => acc + (m.network_rx || 0), 0),
      total_network_tx: metrics.reduce((acc, m) => acc + (m.network_tx || 0), 0)
    };

    res.json({
      success: true,
      data: stats,
      duration,
      samples: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate statistics'
    });
  }
});

export default router;