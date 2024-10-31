/* eslint-disable @typescript-eslint/no-explicit-any */
import { Time } from "lightweight-charts";
import { KlineData } from "../utils/types";
import { changeInterval } from "../utils/helper";

export async function fetchHistoricalData(
  symbol: string,
  interval: string,
  limit: number
): Promise<KlineData[] | null> {
  try {
    const includes1000 = false;
    symbol = symbol.toLowerCase();
    const formattedInterval = changeInterval(interval);
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol
        .toLowerCase()
        .replace(/-/g, "")}&interval=${formattedInterval}&limit=${limit}`
    );

    if (response.ok) {
      const data = await response.json();
      if (!data) {
        return null;
      }
      const candlestickData: KlineData[] = data.map((item: any) => {
        const timestamp = item[0]; // Convert to milliseconds
        return {
          time: (Math.floor(timestamp / 1000) - 4 * 60 * 60) as Time,
          open: includes1000 ? parseFloat(item[1]) * 1000 : parseFloat(item[1]),
          high: includes1000 ? parseFloat(item[2]) * 1000 : parseFloat(item[2]),
          low: includes1000 ? parseFloat(item[3]) * 1000 : parseFloat(item[3]),
          close: includes1000
            ? parseFloat(item[4]) * 1000
            : parseFloat(item[4]),
          volume: parseFloat(item[5]),
          color:
            parseFloat(item[4]) > parseFloat(item[1]) ? "#305D5E" : "#793B3B",
        };
      });

      // Sort data by time
      candlestickData.sort((a, b) => {
        const time1 = a.time as number;
        const time2 = b.time as number;
        return time1 - time2;
      });
      const filteredCandlesticks = candlestickData.filter(
        (item) => item.time !== 0
      );
      return filteredCandlesticks;
    } else {
      console.error(`Failed to fetch data: HTTP ${response.status}`);
      return []; // Return an empty array if the request fails
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return []; // Return an empty array if there's an error
  }
}
