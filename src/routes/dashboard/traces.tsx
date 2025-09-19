import { TraceTimeline } from '@/components/trace/TraceTimeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, Loader2, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/dashboard/traces')({
  component: TracesPage,
})

interface Trace {
  traceId: string
  serviceName: string
  operationName: string
  startTime: number
  duration: number
  status: 'success' | 'error'
  tags: Record<string, any>
}

interface TraceData {
  traceId: string
  rootSpan: any
  spans: any[]
  startTime: number
  duration: number
  serviceCount: number
  spanCount: number
  errorCount: number
}

function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([])
  const [selectedTrace, setSelectedTrace] = useState<TraceData | null>(null)
  const [selectedTraceId, setSelectedTraceId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [loadingTrace, setLoadingTrace] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchTraces = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<{ traces: Trace[], total: number, timestamp: Date }>('/traces?limit=10')
      setTraces(data.traces || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traces')
      console.error('Error fetching traces:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTraceDetails = async (traceId: string) => {
    setLoadingTrace(true)
    setError(null)
    try {
      const data = await apiClient.get<TraceData>(`/traces/${traceId}`)
      setSelectedTrace(data)
      setSelectedTraceId(traceId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trace details')
      console.error('Error fetching trace details:', err)
    } finally {
      setLoadingTrace(false)
    }
  }

  useEffect(() => {
    fetchTraces()
  }, [])

  const handleTraceSelect = (traceId: string) => {
    fetchTraceDetails(traceId)
  }

  const handleSearch = () => {
    if (searchTerm) {
      fetchTraceDetails(searchTerm)
    }
  }

  const filteredTraces = traces.filter(trace =>
    trace.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trace.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trace.operationName.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <Button onClick={fetchTraces} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Traces</CardTitle>
            <CardDescription>Select a trace to view its timeline</CardDescription>
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

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
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
                    >
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium truncate">{trace.traceId}</p>
                            <Badge
                              variant={trace.status === 'error' ? 'destructive' : 'default'}
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {loadingTrace ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="mt-2 text-muted-foreground">Loading trace details...</p>
              </CardContent>
            </Card>
          ) : selectedTrace ? (
            <TraceTimeline
              traceId={selectedTrace.traceId}
              data={selectedTrace}
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {selectedTrace && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Spans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedTrace.spanCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Services Involved</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedTrace.serviceCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Duration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{selectedTrace.duration}ms</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Error Count</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${selectedTrace.errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {selectedTrace.errorCount}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}