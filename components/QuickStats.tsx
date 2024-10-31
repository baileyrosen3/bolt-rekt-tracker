"use client";
import React from "react";
import { MarkerData } from "../utils/types";

interface QuickStatsProps {
  chartMarkers: MarkerData[];
}

export default function QuickStats({ chartMarkers }: QuickStatsProps) {
  const totalRekts = chartMarkers.reduce(
    (sum, marker) => sum + parseFloat(marker.text),
    0
  );

  const largestRektMarker =
    chartMarkers.length > 0
      ? chartMarkers.reduce((max, marker) =>
          parseFloat(marker.text) > parseFloat(max.text) ? marker : max
        )
      : { text: "0", color: "#000000" };
  const largestRekt = parseFloat(largestRektMarker.text);
  const largestRektColor = largestRektMarker.color;

  const { shortRekts, longRekts } = chartMarkers.reduce(
    (acc, marker) => {
      if (marker.position === "aboveBar") {
        acc.shortRekts += parseFloat(marker.text);
      } else if (marker.position === "belowBar") {
        acc.longRekts += parseFloat(marker.text);
      }
      return acc;
    },
    { shortRekts: 0, longRekts: 0 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="text-gray-200">
      <div className="mt-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Summary</h2>
          <p className="text-sm text-gray-400">
            View and sort recent rekt events
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-center m-4">
          <div className="flex flex-col space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-300">Total Rekts</dt>
              <dd className="text-sm font-semibold text-gray-100">
                {formatCurrency(totalRekts)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-300">
                Largest Rekt
              </dt>
              <dd
                className="text-sm font-semibold"
                style={{ color: largestRektColor }}
              >
                {formatCurrency(largestRekt)}
              </dd>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-300">Long Rekts</dt>
              <dd className="text-sm font-semibold text-green-400">
                {formatCurrency(longRekts)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-300">Short Rekts</dt>
              <dd className="text-sm font-semibold text-red-500">
                {formatCurrency(shortRekts)}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
