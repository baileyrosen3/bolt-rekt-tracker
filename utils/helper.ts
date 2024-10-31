import {
  Time,
  SeriesMarkerPosition,
  SeriesMarkerShape,
} from "lightweight-charts";
import { MarkerData, KlineData, RektData } from "./types";
import {
  groupEntriesByIntervalAndPosition,
  parseInterval,
} from "../hooks/usePastRektsData";

export const formatCurrency = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export function createMarker(
  symbol: string,
  time: Time,
  position: string,
  value: number,
  price: number,
  percentile: number
): MarkerData {
  let markerPosition: SeriesMarkerPosition = "aboveBar";
  let markerShape: SeriesMarkerShape = "arrowDown";
  const markerText = `${value.toFixed(2)}`;
  const isLong = position === "Long";

  if (isLong) {
    markerPosition = "belowBar";
    markerShape = "arrowUp";
  }

  const markerColor = getColorForPercentile(percentile, isLong);

  return new MarkerData(
    symbol,
    time,
    markerPosition,
    markerColor,
    markerShape,
    markerText,
    price // Add price to marker data
  );
}

function getColorForPercentile(percentile: number, isLong: boolean): string {
  // Percentile is a value between 0 and 100
  // We want to return a color based on the percentile on a spectrum
  // Long -> 0% to 100% / light green to blue
  // Short -> 0% to 100% / light yellow to dark red

  if (isLong) {
    // For long positions, interpolate from darker green to darker blue
    const r = Math.round(72 - (percentile / 100) * 72);
    const g = Math.round(119 - (percentile / 100) * 59);
    const b = Math.round(72 + (percentile / 100) * 111);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // For short positions, interpolate from darker yellow to darker red
    const r = Math.round(204 - (percentile / 100) * 51);
    const g = Math.round(204 - (percentile / 100) * 204);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export const getMarkerData = (
  rektData: RektData[],
  interval: string,
  percentiles: number[],
  symbol: string,
  showHigherAboveBarMarkers: boolean,
  showLowerBelowBarMarkers: boolean,
  checkAboveBarValue: number,
  checkBelowBarValue: number,
  higherAboveBarColor: string,
  lowerAboveBarColor: string,
  higherBelowBarColor: string,
  lowerBelowBarColor: string,
  showLowerAboveBarMarkers: boolean,
  showHigherBelowBarMarkers: boolean
) => {
  const isInThreshold = (
    value: number,
    percentiles: number[],
    sortedValues: number[]
  ) => {
    const lowPercentile = percentiles[0];
    const highPercentile = percentiles[1];
    const percentile = getPercentile(value, sortedValues);
    return percentile > lowPercentile && percentile < highPercentile;
  };

  // sort rektdata by time
  const sortedRektData = rektData.sort(
    (a, b) => Number(a.time) - Number(b.time)
  );

  const getPercentile = (value: number, values: number[]) => {
    const index = values.findIndex((v) => v >= value);
    return (index / values.length) * 100;
  };
  const intervalSeconds = parseInterval(interval); // Now returns seconds
  const groupedEntries = groupEntriesByIntervalAndPosition(
    sortedRektData,
    intervalSeconds
  );

  let markerData: MarkerData[] = [];
  // Calculate percentiles for all values
  const allValues = groupedEntries.map((entry) => entry.value);
  const sortedValues = allValues.sort((a, b) => a - b);

  // Filter entries based on their percentile
  const filteredEntries = groupedEntries.filter((entry) => {
    return isInThreshold(entry.value, percentiles, sortedValues);
  });
  const filteredValues = filteredEntries.map((entry) => entry.value);
  const filteredSortedValues = filteredValues.sort((a, b) => a - b);

  for (const group of filteredEntries) {
    const { intervalStart, position, value, price } = group;
    const percentile = getPercentile(value, filteredSortedValues);
    const marker = createMarker(
      symbol,
      intervalStart as Time, // Time is in seconds
      position,
      value,
      price,
      percentile
    );
    if (marker.position === "aboveBar") {
      marker.shape = "arrowDown";
    } else {
      marker.shape = "arrowUp";
    }
    markerData.push(marker);
  }

  let highRektMarker = null;
  let lowRektMarker = null;
  // marker without aboveMarkers
  const aboveMarkers = markerData.filter(
    (marker) => marker.position === "aboveBar"
  );
  const belowMarkers = markerData.filter(
    (marker) => marker.position === "belowBar"
  );
  if (showHigherAboveBarMarkers) {
    highRektMarker = aboveMarkers.map((marker, index) => {
      if (index <= checkAboveBarValue) {
        return { ...marker, color: higherAboveBarColor };
      }
      const isHigher = aboveMarkers
        .slice(Math.max(0, index - checkAboveBarValue), index)
        .every((prevMarker) => marker.price > prevMarker.price);

      if (marker.position === "aboveBar" && isHigher) {
        return { ...marker, color: higherAboveBarColor };
      }
      return {
        ...marker,
        color: showHigherBelowBarMarkers ? lowerAboveBarColor : "transparent",
        position: "inBar" as SeriesMarkerPosition,
        shape: "circle" as SeriesMarkerShape,
      };
    });
  }

  if (showLowerBelowBarMarkers) {
    lowRektMarker = belowMarkers.map((marker, index) => {
      if (index <= checkBelowBarValue) {
        return { ...marker, color: higherBelowBarColor };
      }
      const isLower = belowMarkers
        .slice(Math.max(0, index - checkBelowBarValue), index)
        .every((prevMarker) => marker.price < prevMarker.price);

      if (marker.position === "belowBar" && isLower) {
        return { ...marker, color: higherBelowBarColor };
      }
      return {
        ...marker,
        color: showLowerAboveBarMarkers ? lowerBelowBarColor : "transparent",
        position: "inBar" as SeriesMarkerPosition,
        shape: "circle" as SeriesMarkerShape,
      };
    });
  }

  if (highRektMarker && !lowRektMarker) {
    markerData = [...highRektMarker, ...belowMarkers];
  }
  if (lowRektMarker && !highRektMarker) {
    markerData = [...aboveMarkers, ...lowRektMarker];
  }
  if (highRektMarker && lowRektMarker) {
    markerData = [...highRektMarker, ...lowRektMarker];
  }

  return markerData;
};

export const changeInterval = (interval: string) => {
  return interval;
};

export const changeIntervalTimes3 = (interval: string) => {
  console.log("interval", interval);
  switch (interval) {
    case "1m":
      return "5m";
    case "5m":
      return "15m";
    case "15m":
      return "1h";
    case "30m":
      return "2h";
    case "1h":
      return "4h";
    case "4h":
      return "12h";
    default:
      return interval;
  }
};

export const calculateVWAPSeriesData = (
  candleData: KlineData[],
  anchorTimeIndex: Time
) => {
  const vwapData = [];
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < candleData.length; i++) {
    const candle = candleData[i];
    const time = candle.time;
    if (time < anchorTimeIndex) {
      // Provide whitespace data points until the anchor time
      vwapData.push({
        time: candle.time,
      });
    } else {
      // Calculate typical price: (high + low + close) / 3
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;

      // Update cumulative values
      cumulativeTPV += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;

      // Calculate VWAP
      const vwapValue =
        cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : null;

      vwapData.push({
        time: candle.time,
        value: vwapValue,
      });
    }
  }

  return vwapData;
};

export const calculateALWAPSeriesData = (
  dataSlice: MarkerData[],
  startTime: Time,
  isLong: boolean | null
) => {
  let cumulativeLiquidation = 0;
  let cumulativePriceLiquidation = 0;
  const alwapData = [];

  // Filter data based on liquidation direction and ensure valid liquidation data after startTime
  const filteredAndSortedData = dataSlice
    .filter((marker) => {
      return (
        (isLong === null ||
          (isLong && marker.position === "aboveBar") ||
          (!isLong && marker.position === "belowBar")) &&
        marker.time >= startTime
      );
    })
    .sort((a, b) => Number(a.time) - Number(b.time));

  // Remove duplicate times by keeping the last occurrence
  const uniqueDataMap = new Map<Time, MarkerData>();
  filteredAndSortedData.forEach((item) => {
    uniqueDataMap.set(item.time, item);
  });
  const uniqueSortedData = Array.from(uniqueDataMap.values());

  for (const item of uniqueSortedData) {
    const time = item.time;

    // Ensure liquidation value is a valid number
    const liquidationValue = parseFloat(item.text);
    if (isNaN(liquidationValue)) {
      continue; // Skip invalid liquidation values
    }

    // Update cumulative values for liquidation and price * liquidation
    cumulativeLiquidation += liquidationValue;
    cumulativePriceLiquidation += item.price * liquidationValue;

    // Calculate ALWAP only if cumulativeLiquidation is greater than 0
    const alwap =
      cumulativeLiquidation > 0
        ? cumulativePriceLiquidation / cumulativeLiquidation
        : null;

    alwapData.push({
      time: time,
      value: alwap,
    });
  }

  return alwapData;
};

export const calculateCombinedVWAPALWAP = (
  candleData: KlineData[],
  liquidationData: MarkerData[],
  anchorTime: Time,
  isLong: boolean | null
) => {
  // Calculate individual indicators
  const vwapData = calculateVWAPSeriesData(candleData, anchorTime);
  const alwapData = calculateALWAPSeriesData(
    liquidationData,
    anchorTime,
    isLong
  );

  // Create a map of all unique timestamps
  const timeMap = new Map<
    string,
    {
      time: Time;
      vwap: number | null;
      alwap: number | null;
    }
  >();

  // Populate the map with VWAP data
  vwapData.forEach((point) => {
    console.log("point", point);
    const timeKey = point.time.toString();
    timeMap.set(timeKey, {
      time: point.time,
      vwap: point.value ?? null,
      alwap: null,
    });
  });

  // Add ALWAP data to the map
  alwapData.forEach((point) => {
    const timeKey = point.time.toString();
    const existing = timeMap.get(timeKey);
    if (existing) {
      existing.alwap = point.value;
    } else {
      timeMap.set(timeKey, {
        time: point.time,
        vwap: null,
        alwap: point.value,
      });
    }
  });

  // Convert the map to a sorted array and calculate combined values
  const combinedData = Array.from(timeMap.values())
    .sort((a, b) => Number(a.time) - Number(b.time))
    .map((point) => {
      let combinedValue: number | null = null;

      if (point.vwap !== null && point.alwap !== null) {
        // Both indicators have values
        combinedValue = (point.vwap + point.alwap) / 2;
      } else if (point.vwap !== null) {
        // Only VWAP has a value
        combinedValue = point.vwap;
      } else if (point.alwap !== null) {
        // Only ALWAP has a value
        combinedValue = point.alwap;
      }
      if (combinedValue === null) {
        return {
          time: point.time,
        };
      } else {
        return {
          time: point.time,
          value: combinedValue,
        };
      }
    });

  return combinedData;
};

interface CombinedDataPoint {
  time: Time;
  value: number | null;
}

export const calculateSmoothedCombinedVWAPALWAP = (
  candleData: KlineData[],
  liquidationData: MarkerData[],
  anchorTime: Time,
  isLong: boolean | null,
  smoothingPeriod: number = 5 // Adjustable smoothing period
) => {
  // Get raw combined data
  const rawCombinedData = calculateCombinedVWAPALWAP(
    candleData,
    liquidationData,
    anchorTime,
    isLong
  );

  // Apply smoothing
  const smoothedData: CombinedDataPoint[] = [];
  for (let i = 0; i < rawCombinedData.length; i++) {
    const currentPoint = rawCombinedData[i];

    if (currentPoint.value === null) {
      smoothedData.push(currentPoint);
      continue;
    }

    // Calculate simple moving average for smoothing
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - smoothingPeriod + 1); j <= i; j++) {
      if (rawCombinedData[j].value !== null) {
        sum += rawCombinedData[j].value!;
        count++;
      }
    }

    const smoothedValue = count > 0 ? sum / count : null;

    smoothedData.push({
      time: currentPoint.time,
      value: smoothedValue,
    });
  }

  return smoothedData;
};

// Add this function to the helper.ts file
export function findPivotPoints(
  data: KlineData[],
  leftLen: number = 10,
  rightLen: number = 10
) {
  const highs: number[] = [];
  const lows: number[] = [];

  for (let i = leftLen; i < data.length - rightLen; i++) {
    let isPivotHigh = true;
    let isPivotLow = true;

    // Check left side
    for (let j = i - leftLen; j < i; j++) {
      if (data[j].high >= data[i].high) {
        isPivotHigh = false;
      }
      if (data[j].low <= data[i].low) {
        isPivotLow = false;
      }
    }

    // Check right side
    for (let j = i + 1; j <= i + rightLen; j++) {
      if (data[j].high > data[i].high) {
        isPivotHigh = false;
      }
      if (data[j].low < data[i].low) {
        isPivotLow = false;
      }
    }

    if (isPivotHigh) highs.push(i);
    if (isPivotLow) lows.push(i);
  }

  return { highs, lows };
}
