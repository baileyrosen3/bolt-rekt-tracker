import { changeIntervalTimes3 } from "../utils/helper";
import { Time } from "lightweight-charts";
import { OpenInterestStatisticsData } from "../utils/types";

export async function fetchOpenInterestStatistics(
  symbol: string,
  period: string = "5m",
  limit: number = 500
): Promise<OpenInterestStatisticsData[] | null> {
  try {
    const response = await fetch(
      `https://fapi.binance.com/futures/data/openInterestHist?symbol=${symbol.toUpperCase()}&period=${changeIntervalTimes3(
        period
      )}&limit=${limit}`
    );

    if (response.ok) {
      console.log(response);
      const data = await response.json();
      console.log(data);
      if (!data || !Array.isArray(data)) {
        return null;
      }
      const openInterestStats: OpenInterestStatisticsData[] = data.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => ({
          symbol: item.symbol,
          sumOpenInterest: Number(item.sumOpenInterest),
          sumOpenInterestValue: Number(item.sumOpenInterestValue),
          timestamp: (Math.floor(item.timestamp / 1000) - 4 * 60 * 60) as Time,
        })
      );

      // Sort data by timestamp
      openInterestStats.sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp)
      );

      // Filter out any potential invalid timestamps
      const filteredStats = openInterestStats.filter(
        (item) => item.timestamp !== 0
      );

      return filteredStats;
    } else {
      console.error(`Failed to fetch data: HTTP ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching open interest statistics:", error);
    return null;
  }
}
