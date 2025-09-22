import { useEffect, useRef } from 'react';
import { useStore } from '@tanstack/react-store';
import { monitoringStore, monitoringActions } from '@/stores/monitoring-store';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocketStore(url: string = 'ws://localhost:4000') {
  const state = useStore(monitoringStore);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        monitoringActions.setConnectionStatus(true);

        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);

        // Handle different message types using store actions
        switch (message.type) {
          case 'traffic':
            monitoringActions.addTrafficData(message.data);
            break;

          case 'errors':
            monitoringActions.addErrorData(message.data);
            break;

          case 'resources':
            monitoringActions.addResourceData(message.data);
            break;

          case 'security':
            monitoringActions.addSecurityData(message.data);
            break;

          case 'sla':
            monitoringActions.setSLAData(message.data);
            break;
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        monitoringActions.setConnectionStatus(false);

        // Attempt to reconnect if autoReconnect is enabled
        if (state.autoReconnect) {
          monitoringActions.incrementReconnectAttempts();
          reconnectTimeout.current = setTimeout(() => {
            console.log(`Reconnection attempt #${state.reconnectAttempts + 1}`);
            connect();
          }, state.reconnectDelay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        monitoringActions.setConnectionStatus(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      monitoringActions.setConnectionStatus(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return {
    // Connection status
    isConnected: state.isConnected,
    reconnectAttempts: state.reconnectAttempts,

    // Data from store
    trafficData: state.trafficData,
    errorData: state.errorData,
    resourceData: state.resourceData,
    securityData: state.securityData,
    slaData: state.slaData,

    // Actions
    sendMessage,
    clearData: monitoringActions.clearData,
    updateSettings: monitoringActions.updateSettings,

    // Computed values
    latestTraffic: state.trafficData[state.trafficData.length - 1],
    latestError: state.errorData[state.errorData.length - 1],
    latestResource: state.resourceData[state.resourceData.length - 1],
    latestSecurity: state.securityData[state.securityData.length - 1],
  };
}