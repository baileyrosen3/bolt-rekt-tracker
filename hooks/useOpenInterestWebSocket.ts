import { useState, useEffect, useRef } from "react";
import { OpenInterestData } from "../utils/types";
import { fetchOpenInterest } from "../api/openInterest";

export type OpenInterestStatus = "idle" | "loading" | "error";

export function useOpenInterestWebSocket(symbol: string) {
  const [data, setData] = useState<OpenInterestData | null>(null);
  const [status, setStatus] = useState<OpenInterestStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatus("loading");
        const result = await fetchOpenInterest(symbol);
        setData(result);
        setStatus("idle");
        setError(null);
      } catch (err) {
        console.error("Error fetching open interest:", err);
        setStatus("error");
        setError("Failed to fetch open interest data");
      }
    };

    // Fetch immediately on mount
    fetchData();

    // Set up interval to fetch every second
    intervalRef.current = setInterval(fetchData, 1000);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol]);

  return { data, status, error };
}
