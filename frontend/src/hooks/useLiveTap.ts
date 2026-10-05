"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from "@/lib/api";

export interface TapAlert {
  severity: "critical" | "high" | "medium" | "low" | "secure";
  title: string;
  mitre_id: string;
  vector: string;
  description: string;
  timestamp: string;
}

export interface TapState {
  state: "IDLE" | "SNIFFING" | "REPLAYING" | "ERROR";
  pps: number;
  buffer_count: number;
  buffer_capacity: number;
  total_packets_captured: number;
  active_interface: string | null;
  error_message?: string | null;
}

export function useLiveTap() {
  const [tapState, setTapState] = useState<TapState>({
    state: "IDLE",
    pps: 0,
    buffer_count: 0,
    buffer_capacity: 2000,
    total_packets_captured: 0,
    active_interface: null,
  });
  const [activeAlert, setActiveAlert] = useState<TapAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<TapAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let unmounted = false;

    function connectWs() {
      if (unmounted) return;
      try {
        const wsUrl = API_BASE.replace(/^http/, "ws") + "/api/ws/telemetry";
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!unmounted) setIsConnected(true);
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === "INITIAL_STATE" || msg.type === "HEARTBEAT") {
              setTapState(msg.data);
            } else if (msg.type === "COMMAND_RESULT" && msg.status) {
              setTapState(msg.status);
            } else if (msg.type === "SECURITY_ALERT") {
              setActiveAlert(msg.data);
              setAlertHistory((prev) => [msg.data, ...prev].slice(0, 50));
            }
          } catch {
            // Ignore malformed WS frames
          }
        };

        ws.onclose = () => {
          if (!unmounted) {
            setIsConnected(false);
            reconnectTimeout.current = setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (!unmounted) {
          reconnectTimeout.current = setTimeout(connectWs, 4000);
        }
      }
    }

    connectWs();

    return () => {
      unmounted = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
      }
    };
  }, []);

  const sendCommand = useCallback((cmd: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
    }
  }, []);

  const dismissAlert = useCallback(() => setActiveAlert(null), []);
  const clearAlerts = useCallback(() => setAlertHistory([]), []);

  return {
    tapState,
    activeAlert,
    alertHistory,
    isConnected,
    dismissAlert,
    clearAlerts,
    sendCommand,
  };
}
