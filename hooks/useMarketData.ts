import { useEffect, useState } from "react";
import { fetchHistoricalData } from "../api/marketData";
import { KlineData } from "../utils/types";

export function useMarketData(symbol: string, interval: string, limit: number) {
  const [data, setData] = useState<KlineData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      console.log("Loading data for symbol:", symbol);
      setLoading(true);
      const fetchedData = await fetchHistoricalData(symbol, interval, limit);
      setData(fetchedData);
      setLoading(false);
    }
    loadData();
  }, [symbol, interval, limit]);

  return { data, loading };
}
