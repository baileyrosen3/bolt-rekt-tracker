/* eslint-disable @typescript-eslint/no-unused-vars */
import { Time } from "lightweight-charts";
import supabase from "../database/supabaseClient";
import { RektData } from "../utils/types";

export async function fetchPastRekts(
  symbol: string,
  interval: string
): Promise<RektData[]> {
  try {
    let timestamp = 0;
    // UTC-4 date
    if (interval === "1m") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60;
    } else if (interval === "5m") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 5;
    } else if (interval === "15m") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 15;
    } else if (interval === "30m") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 30;
    } else if (interval === "1h") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 60;
    } else if (interval === "4h") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 60 * 4;
    } else if (interval === "1d") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 60 * 24;
    } else if (interval === "1w") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 60 * 24 * 7;
    } else if (interval === "1M") {
      timestamp = Math.floor(Date.now() / 1000) - 1500 * 60 * 60 * 24 * 30;
    }

    const { data, error } = await supabase
      .from(symbol.toLowerCase().replace(/-/g, "") + "_liquidation_data")
      .select()
      .gt("time", timestamp)
      .gt("value", 0);
    const pastRektsData: RektData[] = data as RektData[];
    return pastRektsData;
  } catch (error) {
    console.error(`Request failed: ${error}`);
    return []; // Return an empty array on request exception
  }
}
