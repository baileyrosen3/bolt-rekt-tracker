import { Time } from "lightweight-charts";
import { OpenInterestData } from "../utils/types";

export async function fetchOpenInterest(
  symbol: string
): Promise<OpenInterestData | null> {
  try {
    const response = await fetch(
      `https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol.toUpperCase()}`
    );

    if (response.ok) {
      const data = await response.json();
      if (!data) {
        return null;
      }
      const openInterestData: OpenInterestData = {
        symbol: data.symbol,
        openInterest: Number(data.openInterest),
        time: (Math.floor(data.time / 1000) - 4 * 60 * 60) as Time,
      };
      return openInterestData;
    } else {
      console.error("No data received from the API");
      return null;
    }
  } catch (error) {
    console.error("Error fetching open interest:", error);
    return null;
  }
}
