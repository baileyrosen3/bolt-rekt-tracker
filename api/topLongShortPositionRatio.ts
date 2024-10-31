import { changeIntervalTimes3 } from "../utils/helper";
import { Time } from "lightweight-charts";
import { TopLongShortPositionRatioData } from "../utils/types";

export async function fetchTopLongShortPositionRatio(
  symbol: string,
  period: string = "5m",
  limit: number = 500
): Promise<TopLongShortPositionRatioData[] | null> {
  try {
    const response = await fetch(
      `https://fapi.binance.com/futures/data/topLongShortPositionRatio?symbol=${symbol.toUpperCase()}&period=${changeIntervalTimes3(
        period
      )}&limit=${limit}`
    );

    if (response.ok) {
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        return null;
      }
      const topLongShortPositionRatioData: TopLongShortPositionRatioData[] =
        data.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) => ({
            symbol: item.symbol,
            longShortRatio: Number(item.longShortRatio),
            longAccount: Number(item.longAccount),
            shortAccount: Number(item.shortAccount),
            timestamp: (Math.floor(item.timestamp / 1000) -
              4 * 60 * 60) as Time,
          })
        );

      // Sort data by timestamp
      topLongShortPositionRatioData.sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp)
      );

      // Filter out any potential invalid timestamps
      const filteredData = topLongShortPositionRatioData.filter(
        (item) => item.timestamp !== 0
      );

      return filteredData;
    } else {
      console.error(`Failed to fetch data: HTTP ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching open interest statistics:", error);
    return null;
  }
}
