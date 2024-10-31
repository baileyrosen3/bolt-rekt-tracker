/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { WebSocketManager } from "../utils/WebSocketManager";
import { Time } from "lightweight-charts";
import { KlineData } from "../utils/types";

export type WebSocketStatus = "connecting" | "connected" | "error";

export function useWebSocket(symbol: string, interval: string) {
  const [status, setStatus] = useState<WebSocketStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const webSocketManagerRef = useRef<WebSocketManager | null>(null);
  const isInitialConnectRef = useRef(true);

  const disconnect = useCallback(() => {
    if (webSocketManagerRef.current) {
      console.log(
        `Disconnecting WebSocket for symbol: ${webSocketManagerRef.current.getSymbol()}`
      );
      webSocketManagerRef.current.disconnect();
      webSocketManagerRef.current = null;
    }
  }, []);

  useEffect(() => {
    console.log(
      `Initializing WebSocket for symbol: ${symbol} with interval: ${interval}`
    );

    // Only set status to connecting if it's not the initial connect
    if (!isInitialConnectRef.current) {
      setStatus("connecting");
    }
    setError(null);

    disconnect();

    const connectingTimeoutId = setTimeout(() => {
      if (isInitialConnectRef.current) {
        setStatus("connecting");
        isInitialConnectRef.current = false;
      }
    }, 500); // Delay showing "connecting" status by 500ms on initial connect

    const onMessage = (data: any) => {
      if (data.e === "kline") {
        // console.log("Received kline data:", data);
        const kline = data.k;
        const klineData: KlineData = {
          time: (Math.floor(kline.t / 1000) - 4 * 60 * 60) as Time,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          color:
            parseFloat(kline.c) > parseFloat(kline.o) ? "#305D5E" : "#793B3B",
        };
        setKlineData(klineData);
      }
    };

    const onError = (error: Event | Error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
      setStatus("error");
      if (error instanceof Error) {
        setError(`WebSocket error: ${error.message}`);
      } else if (error instanceof Event && error.type === "error") {
        setError(
          `WebSocket error: ${
            (error.target as WebSocket).url
          } connection failed`
        );
      } else {
        setError("Unknown WebSocket error occurred");
      }
    };

    const onClose = () => {
      console.log(`WebSocket closed for ${symbol}`);
      if (!isInitialConnectRef.current) {
        setStatus("connecting");
      }
      setError(null);
    };

    const onOpen = () => {
      console.log(`WebSocket opened for ${symbol}`);
      setStatus("connected");
      setError(null);
      isInitialConnectRef.current = false;
    };

    const webSocketManager = new WebSocketManager(
      symbol,
      interval, // Pass interval here
      onMessage,
      onError,
      onClose,
      onOpen
    );
    webSocketManagerRef.current = webSocketManager;

    webSocketManager.connect();

    return () => {
      clearTimeout(connectingTimeoutId);
      disconnect();
    };
  }, [symbol, interval, disconnect]);

  return { status, error, klineData };
}
