import { useEffect, useRef, useState } from 'react';

interface WebSocketData {
  type: string;
  data: any;
  timestamp?: Date;
}

export function useWebSocket(url: string = 'ws://localhost:4000') {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketData | null>(null);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [errorData, setErrorData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [securityData, setSecurityData] = useState<any[]>([]);
  const [slaData, setSlaData] = useState<any>(null);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const maxDataPoints = 100;

  const connect = () => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        const message: WebSocketData = JSON.parse(event.data);
        setLastMessage(message);

        // Handle different message types
        switch (message.type) {
          case 'traffic':
            setTrafficData(prev => {
              const newData = [...prev, { ...message.data, timestamp: new Date() }];
              return newData.slice(-maxDataPoints);
            });
            break;

          case 'errors':
            setErrorData(prev => {
              const newData = [...prev, { ...message.data, timestamp: new Date() }];
              return newData.slice(-maxDataPoints);
            });
            break;

          case 'resources':
            setResourceData(prev => {
              const newData = [...prev, { ...message.data, timestamp: new Date() }];
              return newData.slice(-maxDataPoints);
            });
            break;

          case 'security':
            setSecurityData(prev => {
              const newData = [...prev, { ...message.data, timestamp: new Date() }];
              return newData.slice(-maxDataPoints);
            });
            break;

          case 'sla':
            setSlaData(message.data);
            break;
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
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
    isConnected,
    lastMessage,
    trafficData,
    errorData,
    resourceData,
    securityData,
    slaData,
    sendMessage,
  };
}