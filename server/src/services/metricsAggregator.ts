// Simplified metrics aggregator for memory-only mode

export class MetricsAggregator {
  /**
   * Start the aggregation service (disabled in memory-only mode)
   */
  start() {
    console.log('Metrics aggregation service disabled (memory-only mode)');
  }

  /**
   * Stop the aggregation service
   */
  stop() {
    // No-op in memory-only mode
  }

  /**
   * Get aggregated metrics based on time range
   * In memory-only mode, this returns empty array
   */
  getAggregatedMetrics(_timeRange: string): Promise<any[]> {
    return Promise.resolve([]);
  }

  /**
   * Get statistics for a time range
   * In memory-only mode, this returns null
   */
  getMetricsStats(_timeRange: string): Promise<any> {
    return Promise.resolve(null);
  }
}

// Export singleton instance
export const metricsAggregator = new MetricsAggregator();