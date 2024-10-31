import { useState, useEffect } from "react";
import { TopLongShortPositionRatioData } from "../utils/types";
import { fetchTopLongShortPositionRatio } from "../api/topLongShortPositionRatio";

export type TopLongShortPositionRatioStatus = "idle" | "loading" | "error";

export function useTopLongShortPositionRatio(
  symbol: string,
  period: string = "5m",
  limit: number = 500
) {
  const [data, setData] = useState<TopLongShortPositionRatioData[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      console.log("Loading oi for symbol:", symbol);
      setLoading(true);
      const fetchedData = await fetchTopLongShortPositionRatio(
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
