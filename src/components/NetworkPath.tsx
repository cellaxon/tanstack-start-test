import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Position,
  Handle,
  NodeProps,
  getBezierPath,
  EdgeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NetworkNode extends Node {
  data: {
    label: string;
    type: string;
    status?: {
      healthy: boolean;
      load: string;
      connections: number;
    };
  };
}

interface NetworkEdge extends Edge {
  label?: string;
  animated?: boolean;
  data?: {
    traffic: number;
  };
}

interface NetworkMetrics {
  totalRequests: number;
  avgLatency: string;
  successRate: string;
  activeConnections: number;
  bandwidth: {
    inbound: string;
    outbound: string;
  };
  nodeStatus: Record<string, {
    healthy: boolean;
    load: string;
    connections: number;
  }>;
}

const nodeColors: Record<string, string> = {
  client: '#3b82f6',
  cdn: '#8b5cf6',
  loadbalancer: '#06b6d4',
  gateway: '#10b981',
  service: '#f59e0b',
  server: '#ef4444',
  cache: '#ec4899',
  database: '#6366f1',
  monitoring: '#84cc16',
  queue: '#a855f7',
};

const CustomNode: React.FC<NodeProps> = ({ data, id }) => {
  const nodeData = data as NetworkNode['data'];
  const color = nodeColors[nodeData.type] || '#94a3b8';
  const isHealthy = nodeData.status?.healthy !== false;

  return (
    <div
      className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
        isHealthy ? 'bg-white' : 'bg-red-50'
      }`}
      style={{
        borderColor: color,
        minWidth: '150px'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: color }}
      />
      <div className="text-center">
        <div className="text-xs font-bold" style={{ color }}>
          {nodeData.type.toUpperCase()}
        </div>
        <div className="text-sm font-semibold mt-1">{nodeData.label}</div>
        {nodeData.status && (
          <div className="mt-2 text-xs">
            <div className="flex justify-between">
              <span>Load:</span>
              <span className={`font-semibold ${
                parseFloat(nodeData.status.load) > 80 ? 'text-red-500' :
                parseFloat(nodeData.status.load) > 50 ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {nodeData.status.load}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connections:</span>
              <span className="font-semibold">{nodeData.status.connections}</span>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color }}
      />
    </div>
  );
};

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  animated,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const traffic = data?.traffic || 0;
  const strokeWidth = Math.max(2, Math.min(6, traffic / 20));
  const opacity = 0.5 + (traffic / 200);

  return (
    <>
      <path
        id={id}
        className={animated ? 'react-flow__edge-path' : ''}
        d={edgePath}
        stroke={traffic > 70 ? '#ef4444' : traffic > 40 ? '#f59e0b' : '#10b981'}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
        fill="none"
        strokeDasharray={animated ? '5 5' : undefined}
        style={animated ? {
          animation: 'dashdraw 0.5s linear infinite',
        } : undefined}
      />
      {label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: 11 }}
            startOffset="50%"
            textAnchor="middle"
          >
            <tspan dy={-5} fill="#64748b">
              {label}
            </tspan>
          </textPath>
        </text>
      )}
    </>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export function NetworkPath() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<NetworkEdge>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4001/api/dashboard/network-path');
      if (!response.ok) throw new Error('Failed to fetch network data');

      const data = await response.json();

      // Transform nodes
      const transformedNodes: NetworkNode[] = data.nodes.map((node: any) => ({
        id: node.id,
        type: 'custom',
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          type: node.type,
          status: data.metrics.nodeStatus[node.id]
        },
      }));

      // Transform edges
      const transformedEdges: NetworkEdge[] = data.edges.map((edge: any) => ({
        ...edge,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          traffic: edge.traffic
        }
      }));

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      setMetrics(data.metrics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  if (loading && !nodes.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Loading network path...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-96">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Total Requests</div>
              <div className="text-xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Avg Latency</div>
              <div className="text-xl font-bold">{metrics.avgLatency}ms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Success Rate</div>
              <div className="text-xl font-bold">{metrics.successRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Active Connections</div>
              <div className="text-xl font-bold">{metrics.activeConnections}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Inbound</div>
              <div className="text-xl font-bold">{metrics.bandwidth.inbound} Mbps</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">Outbound</div>
              <div className="text-xl font-bold">{metrics.bandwidth.outbound} Mbps</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Network Path Visualization</span>
            <Badge variant="outline" className="ml-2">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px', width: '100%' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <MiniMap
                nodeColor={(node) => nodeColors[node.data.type] || '#94a3b8'}
                maskColor="rgb(50, 50, 50, 0.8)"
              />
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes dashdraw {
          0% {
            stroke-dashoffset: 10;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .react-flow__edge-path {
          animation: dashdraw 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
}