// Start of Selection
import { useState, useEffect, useRef, useCallback } from "react";
import { RektManager } from "../utils/RektManager";
import { RektData } from "../utils/types";
import { parseInterval } from "./usePastRektsData";

export type RektWebSocketStatus = "connecting" | "connected" | "error";

export function useRektWebSocket(symbol: string, interval: string) {
  const [status, setStatus] = useState<RektWebSocketStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [newRekts, setNewRekts] = useState<RektData[]>([]);

  const bufferRef = useRef<RektData[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const RektManagerRef = useRef<RektManager | null>(null);

  const disconnect = useCallback(() => {
    if (RektManagerRef.current) {
      console.log(
        `Disconnecting Rekt WebSocket for symbol: ${RektManagerRef.current.getSymbol()}`
      );
      RektManagerRef.current.disconnect();
      RektManagerRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    console.log(`Initializing Rekt WebSocket for symbol: ${symbol}`);

    setStatus("connecting");
    setError(null);

    disconnect();

    const onRekt = (data: RektData) => {
      // Add incoming data to the buffer
      data.symbol = symbol;
      setNewRekts((prevRekts) => [...prevRekts, data]);
      // bufferRef.current.push(data);
    };

    const onErrorHandler = (error: Error) => {
      console.error(`Rekt WebSocket error for ${symbol}:`, error);
      setStatus("error");
      setError(`Rekt WebSocket error: ${error.message}`);
    };

    const onCloseHandler = () => {
      console.log(`Rekt WebSocket closed for ${symbol}`);
      setStatus("connecting");
      setError(null);
    };

    const onOpenHandler = () => {
      console.log(`Rekt WebSocket opened for ${symbol}`);
      setStatus("connected");
      setError(null);
    };

    const rektManagerInstance = new RektManager(
      symbol,
      onRekt,
      onErrorHandler,
      onCloseHandler,
      onOpenHandler
    );
    RektManagerRef.current = rektManagerInstance;

    rektManagerInstance.connect();

    // Parse the interval
    const intervalSeconds = parseInterval(interval);

    const processBuffer = () => {
      // if (bufferRef.current && bufferRef.current.length > 0) {
      //   setNewRekts((prevRekts) => [...prevRekts, ...bufferRef.current]);
      // }

      // Clear the buffer
      bufferRef.current = [];
    };

    // Calculate time until next interval boundary
    const now = Math.floor(Date.now() / 1000);
    const timeUntilNextInterval = intervalSeconds - (now % intervalSeconds);
    const timeUntilNextIntervalMs = timeUntilNextInterval * 1000;

    // Set a timeout to process the buffer at the next interval boundary
    const initialTimeout = setTimeout(() => {
      // Process buffer at interval boundary
      processBuffer();

      // Set up interval timer to process buffer every interval duration
      timerRef.current = setInterval(processBuffer, intervalSeconds * 1000);
    }, timeUntilNextIntervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      clearTimeout(initialTimeout);
      disconnect();
    };
  }, [symbol, interval, disconnect]);

  return { status, error, markers: newRekts };
}
