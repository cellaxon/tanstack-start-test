import { TraceTimeline } from '@/components/trace/TraceTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, Loader2, RefreshCw, Search, AlertCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTraces, useTraceDetails, useRefreshTraces, usePrefetchTrace } from '@/hooks/useTraces'

export const Route = createFileRoute('/dashboard/traces')({
  component: TracesPage,
})

function TracesPage() {
  const [selectedTraceId, setSelectedTraceId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Use TanStack Query hooks
  const tracesQuery = useTraces(10);
  const traceDetailsQuery = useTraceDetails(selectedTraceId);
  const refreshMutation = useRefreshTraces();
  const prefetchTrace = usePrefetchTrace();

  // Filter traces locally
  const filteredTraces = useMemo(() => {
    if (!tracesQuery.data?.traces) return [];

    if (!searchTerm) return tracesQuery.data.traces;

    return tracesQuery.data.traces.filter(trace =>
      trace.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trace.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trace.operationName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tracesQuery.data?.traces, searchTerm]);

  const handleTraceSelect = (traceId: string) => {
    setSelectedTraceId(traceId);
  };

  const handleTraceHover = (traceId: string) => {
    // Prefetch on hover for better UX
    prefetchTrace(traceId);
  };

  const handleSearch = () => {
    if (searchTerm && !filteredTraces.find(t => t.traceId === searchTerm)) {
      // If exact trace ID not in list, select it anyway to trigger fetch
      setSelectedTraceId(searchTerm);
    }
  };

  const handleRefresh = () => {
    refreshMutation.mutate(10);
  };

  // Determine error state
  const error = tracesQuery.error || traceDetailsQuery.error;
  const isAuthError = error instanceof Error && error.message === 'Authentication failed';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Distributed Tracing
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze and visualize distributed traces across your services
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Error Display */}
      {error && !isAuthError && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
            {tracesQuery.isError && (
              <Button
                onClick={() => tracesQuery.refetch()}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {refreshMutation.isSuccess && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <p className="text-green-600">✓ Traces refreshed successfully</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traces List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Traces</CardTitle>
            <CardDescription>
              Select a trace to view its timeline
              {tracesQuery.data && (
                <span className="ml-2 text-xs">
                  ({filteredTraces.length} of {tracesQuery.data.traces.length} traces)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search traces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {tracesQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tracesQuery.isError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-2">Failed to load traces</p>
                  <Button
                    onClick={() => tracesQuery.refetch()}
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto p-2">
                  {filteredTraces.map((trace) => (
                    <Card
                      key={trace.traceId}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedTraceId === trace.traceId ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTraceSelect(trace.traceId)}
                      onMouseEnter={() => handleTraceHover(trace.traceId)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium truncate">{trace.traceId}</p>
                            <Badge
                              variant={
                                trace.status === 'error' ? 'destructive' :
                                trace.status === 'warning' ? 'outline' :
                                'default'
                              }
                              className="text-xs"
                            >
                              {trace.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{trace.serviceName}</p>
                          <p className="text-xs text-muted-foreground">{trace.operationName}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">
                              {new Date(trace.startTime).toLocaleTimeString()}
                            </p>
                            <p className="text-xs font-medium">{trace.duration}ms</p>
                          </div>
                          {/* Show additional metrics if available */}
                          {trace.spanCount !== undefined && (
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {trace.spanCount} spans
                              </Badge>
                              {trace.errorCount !== undefined && trace.errorCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {trace.errorCount} errors
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredTraces.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No traces match your search' : 'No traces available'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trace Details */}
        <div className="lg:col-span-2">
          {traceDetailsQuery.isLoading ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2 text-muted-foreground">Loading trace details...</p>
              </CardContent>
            </Card>
          ) : traceDetailsQuery.isError ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg font-medium">Failed to load trace</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {traceDetailsQuery.error.message}
                </p>
                <Button
                  onClick={() => traceDetailsQuery.refetch()}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : traceDetailsQuery.data ? (
            <TraceTimeline
              traceId={traceDetailsQuery.data.traceId}
              data={traceDetailsQuery.data}
              height={700}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Select a trace to view</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a trace from the list or search by trace ID
                </p>
                {tracesQuery.isFetching && !tracesQuery.isLoading && (
                  <p className="text-xs text-muted-foreground mt-4">
                    <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                    Updating traces in background...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Trace Statistics */}
      {traceDetailsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Spans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{traceDetailsQuery.data.spanCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Services Involved</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{traceDetailsQuery.data.serviceCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{traceDetailsQuery.data.duration}ms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Error Count</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${
                traceDetailsQuery.data.errorCount > 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {traceDetailsQuery.data.errorCount}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Query States Indicator (for development) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-2 text-xs space-y-1 opacity-50 hover:opacity-100 transition-opacity">
          <div>Traces: {tracesQuery.status}</div>
          <div>Details: {traceDetailsQuery.status}</div>
          {tracesQuery.dataUpdatedAt && (
            <div>Updated: {new Date(tracesQuery.dataUpdatedAt).toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  )
}