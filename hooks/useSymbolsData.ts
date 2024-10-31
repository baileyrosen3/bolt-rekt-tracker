import { useEffect, useState } from "react";
import { fetchSymbolsData } from "../api/symbolsData";

export function useSymbolsData() {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      const fetchedData = await fetchSymbolsData();
      setData(fetchedData);
      setLoading(false);
    }
    loadData();
  }, []);

  return { data, loading };
}
