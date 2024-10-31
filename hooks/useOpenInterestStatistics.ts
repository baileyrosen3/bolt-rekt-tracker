import { useState, useEffect } from "react";
import { fetchOpenInterestStatistics } from "../api/openInterestStatistics";
import { OpenInterestStatisticsData } from "../utils/types";

export type OpenInterestStatus = "idle" | "loading" | "error";

export function useOpenInterestStatistics(
  symbol: string,
  period: string = "5m",
  limit: number = 500
) {
  const [data, setData] = useState<OpenInterestStatisticsData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      console.log("Loading oi for symbol:", symbol);
      setLoading(true);
      const fetchedData = await fetchOpenInterestStatistics(
        symbol,
        period,
        limit
      );
      setData(fetchedData);
      setLoading(false);
    }
    fetchData();
  }, [symbol, period, limit]);

  return { data, loading };
}
