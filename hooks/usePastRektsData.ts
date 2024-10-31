/* eslint-disable @typescript-eslint/no-unused-vars, prefer-const */
import { useEffect, useState } from "react";
import {
  CandlestickData,
  SeriesMarkerPosition,
  SeriesMarkerShape,
  Time,
} from "lightweight-charts";
import { fetchPastRekts } from "../api/pastRekts";
import { createMarker } from "../utils/helper";
import { RektData } from "../utils/types";

export function usePastRektsData(symbol: string, interval: string) {
  const [pastRekts, setPastRekts] = useState<RektData[]>([]);
  const [pastRektsLoading, setPastRektsLoading] = useState<boolean>(true);
  const [pastRektsError, setPastRektsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setPastRektsLoading(true);
      setPastRektsError(null);
      try {
        let pastRektsData = await fetchPastRekts(symbol, interval);
        // Sort data by time
        pastRektsData.sort((a, b) => {
          const time1 = Number(a.time);
          const time2 = Number(b.time);
          return time1 - time2;
        });

        setPastRekts(pastRektsData);
      } catch (error) {
        setPastRektsError("Failed to load past Rekts data.");
      } finally {
        setPastRektsLoading(false);
      }
    }

    loadData();
  }, [symbol, interval]);

  return { pastRekts, pastRektsLoading, pastRektsError };
}

export function parseInterval(interval: string): number {
  // Returns interval in seconds
  if (interval === "60min") {
    return 60 * 60;
  }
  const regex = /(\d+)([a-zA-Z]+)/;
  const match = interval.match(regex);
  if (!match) {
    throw new Error("Invalid interval format");
  }
  const value = parseInt(match[1]);
  const unit = match[2];
  let multiplier;
  switch (unit) {
    case "h":
      multiplier = 60 * 60;
      break;
    case "m":
      multiplier = 60;
      break;
    case "d":
      multiplier = 24 * 60 * 60;
      break;
    case "w":
      multiplier = 7 * 24 * 60 * 60;
      break;
    case "M":
      multiplier = 30 * 24 * 60 * 60;
      break;
    default:
      throw new Error("Unknown interval unit");
  }

  return value * multiplier;
}

export function groupEntriesByIntervalAndPosition(
  entries: RektData[],
  intervalSeconds: number
) {
  const groups = new Map<
    string,
    {
      intervalStart: number;
      value: number;
      position: string;
      price: number;
      count: number;
    }
  >();

  for (const entry of entries) {
    const time = Number(entry.time); // Time in seconds
    const intervalStart = Math.floor(time / intervalSeconds) * intervalSeconds;
    const key = `${intervalStart}-${entry.position}`;

    if (!groups.has(key)) {
      groups.set(key, {
        intervalStart,
        value: entry.value,
        position: entry.position,
        price: entry.price,
        count: 1,
      });
    } else {
      const group = groups.get(key)!;
      group.value += entry.value;
      group.price =
        (group.price * group.count + entry.price) / (group.count + 1);
      group.count++;
    }
  }
  return Array.from(groups.values());
}
