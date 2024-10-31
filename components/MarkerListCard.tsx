"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SeriesMarker, Time } from "lightweight-charts";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowUpDown, List, Grid } from "lucide-react";
import { MarkerData } from "../utils/types";
import "../styles/customScrollbars.css"; // Import custom scrollbar styles
import { formatCurrency } from "../utils/helper";
import QuickStats from "./QuickStats";

interface MarkerListCardProps {
  markers: MarkerData[];
  // filters: Filters; // Add this line
}

interface MarkerWithDateAndValue
  extends Omit<SeriesMarker<Time>, "time" | "text"> {
  date: Date;
  value: number;
  price: number; // Added price field
  color: string; // Added color field
}

type SortKey = "date" | "value" | "price"; // Added price to SortKey

type SortOrder = "asc" | "desc";
type ViewMode = "table" | "grid";

const MarkerListCard: React.FC<MarkerListCardProps> = ({
  markers,
  // filters,
}) => {
  const [markersWithDateAndValue, setMarkersWithDateAndValue] = useState<
    MarkerWithDateAndValue[]
  >([]);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const convertedMarkers = markers.map((marker) => {
      let date: Date;
      if (marker.time instanceof Date) {
        date = marker.time;
      } else if (typeof marker.time === "number") {
        date = new Date(
          marker.time * (marker.time.toString().length === 10 ? 1000 : 1)
        );
      } else {
        date = new Date();
      }

      return {
        ...marker,
        date: new Date(date.getTime() + 4 * 60 * 60 * 1000), // + 4 hours
        value: parseFloat(marker.text || "0"),
        price: marker.price || 0, // Include price in the mapping
        color: marker.color || "#000000", // Include color in the mapping
      };
    });
    setMarkersWithDateAndValue(convertedMarkers);
  }, [markers]);

  const sortedMarkers = useMemo(() => {
    return [...markersWithDateAndValue].sort((a, b) => {
      if (sortKey === "date") {
        return sortOrder === "asc"
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else if (sortKey === "value") {
        return sortOrder === "asc" ? a.value - b.value : b.value - a.value;
      } else {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price; // Added sorting by price
      }
    });
  }, [markersWithDateAndValue, sortKey, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const getTextColorForBackground = (bgColor: string) => {
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 186 ? "black" : "white";
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 rounded-lg shadow-lg">
      {/* empty gray box like seetings div */}
      <div>
        <QuickStats chartMarkers={markers} />
      </div>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Select
            value={sortKey}
            onValueChange={(value: SortKey) => setSortKey(value)}
          >
            <SelectTrigger className="w-[140px] text-sm text-gray-200 bg-gray-800 border-gray-700 rounded-md">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="text-gray-200 bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
            className="text-gray-200 bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            {viewMode === "table" ? (
              <Grid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-black">
        {viewMode === "table" ? (
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-700 bg-gray-800">
                  <TableHead className="text-xs text-gray-200 font-bold">
                    Value & Price
                  </TableHead>
                  <TableHead className="text-xs text-gray-200 font-bold">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMarkers.map((marker, index) => {
                  const bgColor = marker.color;
                  const textColor = getTextColorForBackground(bgColor);
                  return (
                    <TableRow
                      key={index}
                      className={`border-b border-gray-700 ${textColor} transition-colors duration-200 hover:bg-opacity-80`}
                      style={{ backgroundColor: bgColor }}
                    >
                      <TableCell className="font-medium py-2">
                        <span className="text-xs font-bold">
                          {formatCurrency(marker.value, 2)}
                        </span>
                        <span className="text-xs ml-2 opacity-80">
                          @ {formatCurrency(marker.price, 4)}
                        </span>
                      </TableCell>
                      <TableCell className="text-[10px] py-2">
                        {marker.date.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 p-1 rounded-lg">
            {sortedMarkers.map((marker, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  backgroundColor: marker.color,
                  boxShadow: `0 2px 4px -1px ${marker.color}40, 0 1px 2px -1px ${marker.color}30`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-transparent" />
                <div className="relative p-2 text-white">
                  <p className="text-xs font-bold mb-0.5 leading-tight">
                    {formatCurrency(marker.value, 2)}
                  </p>
                  <p className="text-[10px] font-medium mb-1 leading-tight opacity-90">
                    @ {formatCurrency(marker.price, 4)}
                  </p>
                  <p className="text-[8px] opacity-75 leading-tight">
                    {marker.date.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkerListCard;
