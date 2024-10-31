import { useState, useEffect, useRef } from "react";
import { TopLongShortPositionRatioData } from "../utils/types";
import { fetchTopLongShortPositionRatio } from "../api/topLongShortPositionRatio";

export type TopLongShortPositionRatioStatus = "idle" | "loading" | "error";

export function useTopLongShortPositionRatioWebSocket(
  symbol: string,
  period: string = "5m",
  limit: number = 500
) {
  const [data, setData] = useState<TopLongShortPositionRatioData | null>(null);
  const [status, setStatus] = useState<TopLongShortPositionRatioStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStatus("loading");
        const result = await fetchTopLongShortPositionRatio(
          symbol,
          period,
          limit
        );
        setData(result?.[result.length - 1] ?? null);
        setStatus("idle");
        setError(null);
      } catch (err) {
        console.error("Error fetching top long short position ratio:", err);
        setStatus("error");
        setError("Failed to fetch top long short position ratio data");
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
  }, [symbol, period, limit]);

  return { data, status, error };
}
