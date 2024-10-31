import React, { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import { Helmet } from "react-helmet";

import RektChart from "./RektChart";
import MarkerListCard from "./MarkerListCard";
import { usePastRektsData } from "../hooks/usePastRektsData";
import { Filters, MarkerData, RektData } from "../utils/types";
import { useRektWebSocket } from "../hooks/useRektWebSocket";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { getMarkerData } from "../utils/helper";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Toaster } from "./ui/toaster";

export default function RektDashboard() {
  const [filters, setFilters] = useState<Filters>({
    symbol: "POPCATUSDT",
    percentiles: [0, 100],
    interval: "5m",
    topMarkersCount: 0,
    allowAlertToasts: true,
    showHigherAboveBarMarkers: true,
    showLowerAboveBarMarkers: true,
    showHigherBelowBarMarkers: true,
    showLowerBelowBarMarkers: true,
    checkAboveBarValue: 17,
    checkBelowBarValue: 16,
    higherAboveBarColor: "#16e03a",
    lowerAboveBarColor: "#3a6442",
    higherBelowBarColor: "#df1f11",
    lowerBelowBarColor: "#523533",
  });
  const [isClient, setIsClient] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [play] = useSound("/assets/get-rekt.mp3", {
    soundEnabled: isClient,
    interrupt: false,
  });

  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        setIsClient(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isClient]);

  const { pastRekts, pastRektsLoading, pastRektsError } = usePastRektsData(
    filters.symbol.toLowerCase().replace(/-/g, ""),
    filters.interval
  );

  const { status: newRektStatus, markers: newRekts } = useRektWebSocket(
    filters.symbol,
    filters.interval
  );

  const sectionRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [rektData, setRektData] = useState<RektData[]>([]);

  useEffect(() => {
    if (pastRekts && pastRekts.length > 0) {
      setRektData(pastRekts);
    }
  }, [pastRekts]);

  useEffect(() => {
    if (newRekts && newRekts.length > 0) {
      const latestRekt = newRekts[newRekts.length - 1];
      setRektData((prevRektData: RektData[]) => [...prevRektData, latestRekt]);
      if (filters.allowAlertToasts) {
        let title = "";
        let description = "";
        if (latestRekt.position === "aboveBar") {
          title = "Rekt Short Detected";
          description = `${latestRekt.symbol}: ${latestRekt.value} at ${latestRekt.price}`;
        } else {
          title = "Rekt Long Detected";
          description = `${latestRekt.symbol}: ${latestRekt.value} at ${latestRekt.price}`;
        }
        toast({
          title: title,
          description: description,
          action: <Button variant="outline" size="sm"></Button>,
          duration: Infinity, // Keep the toast until dismissed
        });
        setIsClient(true);
      }
    }
  }, [newRekts, toast, filters.allowAlertToasts]);

  useEffect(() => {
    if (rektData && rektData.length > 0) {
      const markerData = getMarkerData(
        rektData,
        filters.interval,
        filters.percentiles,
        filters.symbol,
        filters.showHigherAboveBarMarkers,
        filters.showLowerBelowBarMarkers,
        filters.checkAboveBarValue,
        filters.checkBelowBarValue,
        filters.higherAboveBarColor,
        filters.lowerAboveBarColor,
        filters.higherBelowBarColor,
        filters.lowerBelowBarColor,
        filters.showLowerAboveBarMarkers,
        filters.showHigherBelowBarMarkers
      );
      setMarkers(markerData);
    }
  }, [
    filters.interval,
    filters.percentiles,
    filters.symbol,
    filters.showHigherAboveBarMarkers,
    filters.showLowerBelowBarMarkers,
    filters.checkAboveBarValue,
    filters.checkBelowBarValue,
    rektData,
    filters.higherAboveBarColor,
    filters.lowerAboveBarColor,
    filters.higherBelowBarColor,
    filters.lowerBelowBarColor,
    filters.showLowerAboveBarMarkers,
    filters.showHigherBelowBarMarkers,
  ]);

  useEffect(() => {
    if (isClient) {
      play();
    }
  }, [isClient, play]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <Helmet>
        <title>Rekt Tracker</title>
        <link rel="icon" href="/src/app/assets/BeCompounding_Logo_White.ico" />
      </Helmet>
      <div className="flex h-screen bg-black text-white">
        {/* Main Content */}
        <div
          className={`flex-1 overflow-hidden ${
            sidebarOpen ? "w-[70%]" : "w-[100%]"
          } transition-all duration-300`}
        >
          <div className="flex-grow relative">
            <RektChart
              parentContainerRef={sectionRef}
              sidebarOpen={sidebarOpen}
              filters={filters}
              setFilters={setFilters}
              pastRektMarkersLoading={pastRektsLoading}
              pastRektMarkersError={pastRektsError}
              rektWsStatus={newRektStatus}
              rektMarkers={markers}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "w-[30%]" : "w-0"
          } overflow-hidden`}
        >
          <div className="pt-4 pr-6 bg-[#1e222d] border-b border-[#2a2e39] overflow-auto h-full pl-6">
            <button
              onClick={toggleSidebar}
              className="absolute top-1 right-4 z-10 "
            >
              {sidebarOpen ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
            {sidebarOpen && <MarkerListCard markers={markers} />}
          </div>
        </div>

        <Toaster />
      </div>
    </>
  );
}
