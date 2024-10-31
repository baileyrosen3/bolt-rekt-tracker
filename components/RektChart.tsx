/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
} from "react";
import {
  createChart,
  ColorType,
  Time,
  TimeChartOptions,
  ISeriesApi,
  MouseEventParams,
  CandlestickData,
  LineSeriesOptions,
  LineWidth,
} from "lightweight-charts";
import {
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaChevronUp,
  FaChevronDown,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import { BeatLoader } from "react-spinners";
import { parseInterval } from "../hooks/usePastRektsData";
import { DeepPartial } from "klinecharts";
import { useMarketData } from "../hooks/useMarketData";
import { useWebSocket } from "../hooks/useWebSocket";
import {
  calculateVWAPSeriesData,
  formatCurrency,
  calculateALWAPSeriesData,
  findPivotPoints,
} from "../utils/helper";
import {
  Filters,
  MarkerData,
  VolumeData,
  AnchoredWAP,
  VWAPData,
} from "../utils/types";
import SettingsCard from "./SettingsCard";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useOpenInterestStatistics } from "../hooks/useOpenInterestStatistics";
import { useOpenInterestWebSocket } from "../hooks/useOpenInterestWebSocket";
import { useTopLongShortPositionRatio } from "../hooks/useTopLongShortPositionRatio";
import { createRoot } from "react-dom/client";
import { HexColorPicker } from "react-colorful";
import { useTopLongShortPositionRatioWebSocket } from "../hooks/useTopLongShortPositionRatioWebSocket";
import { calculateMidas } from "../utils/indicators/Midas";
import { Switch } from "./ui/switch";

function getIntervalStartTime(time: number, interval: string): number {
  const intervalSeconds = parseInterval(interval); // Returns interval in seconds
  const timeInSeconds = Math.floor(time);
  const intervalStart =
    Math.floor(timeInSeconds / intervalSeconds) * intervalSeconds;
  return intervalStart;
}

interface RektChartProps {
  parentContainerRef: React.RefObject<HTMLDivElement>;
  sidebarOpen: boolean;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  pastRektMarkersLoading: boolean;
  pastRektMarkersError: string | null;
  rektWsStatus: string;
  rektMarkers: MarkerData[];
}

const RektChart: React.FC<RektChartProps> = ({
  parentContainerRef,
  sidebarOpen,
  filters,
  setFilters,
  pastRektMarkersLoading,
  pastRektMarkersError,
  rektWsStatus,
  rektMarkers,
}) => {
  const { data, loading } = useMarketData(
    filters.symbol,
    filters.interval,
    1500
  );

  const [updatedData, setUpdatedData] = useState(data);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState("");

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorsButtonRef = useRef<HTMLDivElement | null>(null);

  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const openInterestSeriesRef = useRef<any>(null);
  const topLongShortPositionRatioSeriesRef = useRef<any>(null);
  const topLongPositionRatioSeriesRef = useRef<any>(null);
  const topShortPositionRatioSeriesRef = useRef<any>(null);

  const {
    status: wsStatus,
    error: wsError,
    klineData,
  } = useWebSocket(filters.symbol, filters.interval);

  const [isAddingVWAP, setIsAddingVWAP] = useState(false);
  const [isAddingMidas, setIsAddingMidas] = useState(false);
  const [tempColor, setTempColor] = useState<string>("");
  const [tempLineWidth, setTempLineWidth] = useState<number>(1);
  const [decimalLength, setDecimalLength] = useState<number>(2);

  // Additional state for ALWAP (Long & Short)

  const [isAddingALWAP, setIsAddingALWAP] = useState(false);
  const [isAddingALWAPLong, setIsAddingALWAPLong] = useState(false);
  const [isAddingALWAPShort, setIsAddingALWAPShort] = useState(false);

  // State to manage filter options
  const [markerOption, setMarkerOption] = useState("all");
  const [showHigherAboveBarMarkers, setShowHigherAboveBarMarkers] =
    useState(false);
  const [showLowerBelowBarMarkers, setShowLowerBelowBarMarkers] =
    useState(false);

  // Add this state for the check value
  const [checkAboveBarValue, setCheckAboveBarValue] = useState(4);
  const [checkBelowBarValue, setCheckBelowBarValue] = useState(4);

  const { data: openInterestData, loading: openInterestLoading } =
    useOpenInterestStatistics(filters.symbol, filters.interval, 500); // Adjust period and limit as needed

  // useOpenInterestWebSocket
  const {
    data: openInterestWebSocketData,
    status: openInterestWebSocketStatus,
    error: openInterestWebSocketError,
  } = useOpenInterestWebSocket(filters.symbol);

  const {
    data: topLongShortPositionRatioData,
    loading: topLongShortPositionRatioLoading,
  } = useTopLongShortPositionRatio(filters.symbol, filters.interval, 500);

  const {
    data: topLongShortPositionRatioWebSocketData,
    status: topLongShortPositionRatioWebSocketStatus,
    error: topLongShortPositionRatioWebSocketError,
  } = useTopLongShortPositionRatioWebSocket(
    filters.symbol,
    filters.interval,
    500
  );

  // Add these state variables
  const [showVolume, setShowVolume] = useState(true);
  const [showOpenInterest, setShowOpenInterest] = useState(true);
  const [showTopLongShortRatio, setShowTopLongShortRatio] = useState(true);
  const [showLongAccount, setShowLongAccount] = useState(false);
  const [showShortAccount, setShowShortAccount] = useState(false);

  // Consolidate all VWAP-related state into a single list
  const [anchoredVWAPs, setAnchoredVWAPs] = useState<AnchoredWAP[]>([]);
  const [chartSeries, setChartSeries] = useState<Map<string, any>>(new Map());

  // Add this state to keep track of the number of VWAP elements
  const [vwapElementCount, setVwapElementCount] = useState(0);

  // State to manage the visibility of VWAP elements
  const [showVWAPElements, setShowVWAPElements] = useState(true);

  // Function to toggle the visibility of VWAP elements
  const toggleVWAPElements = () => {
    setShowVWAPElements((prev) => !prev);
  };

  // Debugging useEffect to monitor tempColor changes
  useEffect(() => {
    console.log("tempColor changed:", tempColor);
  }, [tempColor]);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chartOptions: DeepPartial<TimeChartOptions> = {
      layout: {
        textColor: "white",
        background: {
          type: ColorType.VerticalGradient,
          topColor: "#191919", // Dark Gray
          bottomColor: "#000000", // Black
        },
      },
      grid: {
        vertLines: { color: "#222" }, // Dark Gray
        horzLines: { color: "#222" }, // Dark Gray
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      autoSize: false,
    };

    const chart = createChart(chartContainerRef.current, chartOptions);

    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.resize(
        parentContainerRef.current?.clientWidth || window.innerWidth,
        (parentContainerRef.current?.clientHeight || window.innerHeight) - 32
      );
    };

    window.addEventListener("resize", handleResize);
    chartRef.current = chart;

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      console.log("chart removed");
    };
  }, [parentContainerRef]);

  useEffect(() => {
    setTimeout(() => {
      chartRef.current.resize(
        parentContainerRef.current?.clientWidth || window.innerWidth,
        (parentContainerRef.current?.clientHeight || window.innerHeight) - 32
      );
    }, 301);
  }, [sidebarOpen, parentContainerRef]);

  useEffect(() => {
    if (data && data.length > 0) {
      const series = chartRef.current.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: true,
        wickUpColor: "#459782",
        wickDownColor: "#df484c",
      });

      series.priceScale().applyOptions({
        autoScale: true,
        mode: 1,
        scaleMargins: {
          top: 0.0,
          bottom: 0.3,
        },
      });

      candlestickSeriesRef.current = series;
      const candlesticks = data.map((item) => {
        return {
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        };
      });
      candlestickSeriesRef.current.setData(candlesticks);

      // Determine the appropriate decimal length
      const lastPrice = candlesticks[candlesticks.length - 1].close;
      const newDecimalLength = (lastPrice.toString().split(".")[1] || "")
        .length;
      setDecimalLength(newDecimalLength);

      candlestickSeriesRef.current.applyOptions({
        priceFormat: {
          type: "price",
          precision: newDecimalLength,
          minMove: 1 / Math.pow(10, newDecimalLength),
        },
      });

      setUpdatedData(data);

      chartRef.current.timeScale().fitContent();
    }
    return () => {
      if (chartRef.current && candlestickSeriesRef.current) {
        chartRef.current.removeSeries(candlestickSeriesRef.current);
        candlestickSeriesRef.current = null;
      }
    };
  }, [data]);

  useEffect(() => {
    if (data && data.length > 0) {
      if (showVolume) {
        const volumeSeries = chartRef.current.addHistogramSeries({
          priceFormat: {
            type: "volume",
          },
          priceScaleId: "volume",
        });
        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.9,
            bottom: 0,
          },
        });
        volumeSeriesRef.current = volumeSeries;

        const volume = data.map((item) => ({
          time: item.time,
          value: item.volume,
          color: item.color,
        }));

        volumeSeriesRef.current.setData(volume);
      } else if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
        volumeSeriesRef.current = null;
      }

      chartRef.current.timeScale().fitContent();
    }
    return () => {
      if (chartRef.current && volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
        volumeSeriesRef.current = null;
      }
    };
  }, [data, showVolume]);

  useEffect(() => {
    if (openInterestData && openInterestData.length > 0 && showOpenInterest) {
      const openInterestSeries = chartRef.current.addLineSeries({
        color: "purple",
        lineWidth: 1,
        priceScaleId: "openInterest",
      });

      openInterestSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.75, // highest point of the series will be 70% away from the top
          bottom: 0.05,
        },
      });

      openInterestSeriesRef.current = openInterestSeries;

      const openInterest = openInterestData.map((item) => {
        return {
          time: Number(item.timestamp),
          value: item.sumOpenInterest,
        };
      });

      openInterestSeries.setData(openInterest);

      chartRef.current.timeScale().fitContent();
    } else if (openInterestSeriesRef.current) {
      chartRef.current.removeSeries(openInterestSeriesRef.current);
      openInterestSeriesRef.current = null;
    }
    return () => {
      if (chartRef.current && openInterestSeriesRef.current) {
        chartRef.current.removeSeries(openInterestSeriesRef.current);
        openInterestSeriesRef.current = null;
      }
    };
  }, [openInterestData, showOpenInterest]);

  useEffect(() => {
    if (
      topLongShortPositionRatioData &&
      topLongShortPositionRatioData.length > 0
    ) {
      const mode = 0;
      const autoScale = true;
      if (showTopLongShortRatio) {
        const topLongShortPositionRatioSeries = chartRef.current.addLineSeries({
          color: "blue",
          lineWidth: 1,
          priceScaleId: "topLongShortPositionRatio",
        });

        topLongShortPositionRatioSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.75, // highest point of the series will be 70% away from the top
            bottom: 0.05,
          },
        });

        topLongShortPositionRatioSeriesRef.current =
          topLongShortPositionRatioSeries;

        const topLongShortPositionRatio = topLongShortPositionRatioData.map(
          (item) => {
            return {
              time: Number(item.timestamp),
              value: item.longShortRatio,
            };
          }
        );

        topLongShortPositionRatioSeries.setData(topLongShortPositionRatio);
      } else if (topLongShortPositionRatioSeriesRef.current) {
        chartRef.current.removeSeries(
          topLongShortPositionRatioSeriesRef.current
        );
        topLongShortPositionRatioSeriesRef.current = null;
      }

      if (showLongAccount) {
        const topLongPositionRatioSeries = chartRef.current.addLineSeries({
          color: "green",
          lineWidth: 1,
          priceScaleId: "topLongPositionRatio",
        });

        topLongPositionRatioSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.75, // highest point of the series will be 70% away from the top
            bottom: 0.05,
          },
          mode: mode,
          autoScale: autoScale,
        });

        topLongPositionRatioSeriesRef.current = topLongPositionRatioSeries;

        const topLongPositionRatio = topLongShortPositionRatioData.map(
          (item) => {
            return {
              time: Number(item.timestamp),
              value: item.longAccount,
            };
          }
        );

        topLongPositionRatioSeries.setData(topLongPositionRatio);
      } else if (topLongPositionRatioSeriesRef.current) {
        chartRef.current.removeSeries(topLongPositionRatioSeriesRef.current);
        topLongPositionRatioSeriesRef.current = null;
      }

      if (showShortAccount) {
        const topShortPositionRatioSeries = chartRef.current.addLineSeries({
          color: "red",
          lineWidth: 1,
          priceScaleId: "topShortPositionRatio",
        });

        topShortPositionRatioSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.75, // highest point of the series will be 70% away from the top
            bottom: 0.05,
          },
          // highest value 1, lowest value 0
          mode: mode,
          autoScale: autoScale,
        });

        topShortPositionRatioSeriesRef.current = topShortPositionRatioSeries;

        const topShortPositionRatio = topLongShortPositionRatioData.map(
          (item) => {
            return {
              time: Number(item.timestamp),
              value: item.shortAccount,
            };
          }
        );

        topShortPositionRatioSeries.setData(topShortPositionRatio);
      } else if (topShortPositionRatioSeriesRef.current) {
        chartRef.current.removeSeries(topShortPositionRatioSeriesRef.current);
        topShortPositionRatioSeriesRef.current = null;
      }

      chartRef.current.timeScale().fitContent();
    }
    return () => {
      if (chartRef.current) {
        if (topLongShortPositionRatioSeriesRef.current) {
          chartRef.current.removeSeries(
            topLongShortPositionRatioSeriesRef.current
          );
          topLongShortPositionRatioSeriesRef.current = null;
        }
        if (topLongPositionRatioSeriesRef.current) {
          chartRef.current.removeSeries(topLongPositionRatioSeriesRef.current);
          topLongPositionRatioSeriesRef.current = null;
        }
        if (topShortPositionRatioSeriesRef.current) {
          chartRef.current.removeSeries(topShortPositionRatioSeriesRef.current);
          topShortPositionRatioSeriesRef.current = null;
        }
      }
    };
  }, [
    topLongShortPositionRatioData,
    showTopLongShortRatio,
    showLongAccount,
    showShortAccount,
  ]);

  useEffect(() => {
    setTimeout(() => {
      if (candlestickSeriesRef.current && klineData) {
        const candlestick: CandlestickData<Time> = {
          time: klineData.time,
          open: klineData.open,
          high: klineData.high,
          low: klineData.low,
          close: klineData.close,
        };

        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          candlestickSeriesRef.current.update(candlestick);

          // Update the updatedData state with the new klineData
          setUpdatedData((prevData) => {
            if (
              !prevData ||
              prevData[prevData.length - 1]?.time !== klineData.time
            ) {
              return [...(prevData || []), klineData];
            }
            return prevData;
          });
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [klineData, updatedData]);

  useEffect(() => {
    setTimeout(() => {
      if (volumeSeriesRef.current && klineData) {
        const volume: VolumeData = {
          time: klineData.time,
          value: klineData.volume,
          color: klineData.color,
        };

        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          volumeSeriesRef.current.update(volume);
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [klineData, updatedData]);

  useEffect(() => {
    setTimeout(() => {
      if (
        openInterestSeriesRef.current &&
        openInterestWebSocketData &&
        klineData
      ) {
        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          openInterestSeriesRef.current.update({
            time: klineData.time,
            value: openInterestWebSocketData.openInterest,
          });
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [
    klineData,
    openInterestWebSocketData,
    topLongShortPositionRatioWebSocketData,
    updatedData,
  ]);

  useEffect(() => {
    setTimeout(() => {
      if (
        topLongShortPositionRatioSeriesRef.current &&
        topLongShortPositionRatioWebSocketData &&
        klineData
      ) {
        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          topLongShortPositionRatioSeriesRef.current.update({
            time: klineData.time,
            value: topLongShortPositionRatioWebSocketData.longShortRatio,
          });
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [klineData, topLongShortPositionRatioWebSocketData, updatedData]);

  useEffect(() => {
    setTimeout(() => {
      if (
        topLongPositionRatioSeriesRef.current &&
        topLongShortPositionRatioWebSocketData &&
        klineData
      ) {
        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          topLongPositionRatioSeriesRef.current.update({
            time: klineData.time,
            value: topLongShortPositionRatioWebSocketData.longAccount,
          });
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [klineData, topLongShortPositionRatioWebSocketData, updatedData]);

  useEffect(() => {
    setTimeout(() => {
      if (
        topShortPositionRatioSeriesRef.current &&
        topLongShortPositionRatioWebSocketData &&
        klineData
      ) {
        // Ensure the new data point is not older than the last data point
        if (
          !updatedData?.length ||
          klineData.time >= updatedData[updatedData.length - 1].time
        ) {
          topShortPositionRatioSeriesRef.current.update({
            time: klineData.time,
            value: topLongShortPositionRatioWebSocketData.shortAccount,
          });
        } else {
          console.warn("Received older data point, skipping update", klineData);
        }
      }
    }, 1000);
  }, [klineData, topLongShortPositionRatioWebSocketData, updatedData]);

  useEffect(() => {
    setIsLoading(
      loading ||
        pastRektMarkersLoading ||
        wsStatus === "connecting" ||
        rektWsStatus === "connecting" ||
        !data ||
        data.length === 0
    );
  }, [loading, pastRektMarkersLoading, wsStatus, rektWsStatus, data]);

  useEffect(() => {
    if (wsStatus === "error") {
      setIsError(wsStatus);
    } else if (rektWsStatus === "error") {
      setIsError(rektWsStatus);
    } else if (pastRektMarkersError) {
      setIsError(pastRektMarkersError);
    } else {
      setIsError("");
    }
  }, [wsStatus, rektWsStatus, pastRektMarkersError]);

  const handleAddVWAP = useCallback(() => {
    setIsAddingVWAP(true);
  }, []);

  // Update handleDeleteVWAP to ensure all VWAP line series are removed safely
  const handleDeleteVWAP = useCallback(
    (id: string) => {
      console.log("DELETING", id);
      // Remove the corresponding container element
      const container = chartContainerRef.current;
      if (container) {
        const elementToRemove = container.querySelector(
          `[data-vwap-id="${id}"]`
        );
        if (elementToRemove) {
          elementToRemove.remove();
        }

        // Adjust positions of remaining elements
        const vwapElements = container.querySelectorAll("[data-vwap-id]");
        vwapElements.forEach((element, index) => {
          (element as HTMLElement).style.top = `${(index + 1) * 30}px`;
        });
      }

      setChartSeries((prevSeries) => {
        const seriesToDelete = prevSeries.get(id);
        // Remove the series from the chart if it exists
        if (chartRef.current) {
          try {
            chartRef.current.removeSeries(seriesToDelete);
          } catch (error) {
            console.error("Error removing series:", error);
          }
        }
        prevSeries.delete(id);
        return prevSeries;
      });

      setAnchoredVWAPs((prevVWAPs) => {
        return prevVWAPs.filter((vwap) => vwap.id !== id);
      });
    },
    [chartRef]
  );

  const handleColorChange = useCallback((color: string) => {
    setTempColor(color); // Ensure this is the only place setting tempColor
    console.log("tempColor changed:", color);
  }, []);

  const handleLineWidthChange = useCallback((value: number) => {
    if (!isNaN(value) && value > 0 && value <= 10) {
      setTempLineWidth(value);
    }
  }, []);

  // Modify the handleVWAPStyleChangeComplete function
  const handleVWAPStyleChangeComplete = useCallback(
    (vwap: AnchoredWAP, newColor: string, newLineWidth: number) => {
      if (vwap) {
        console.log("Applying changes for VWAP:", vwap.id);
        const newOptions: Partial<LineSeriesOptions> = {
          color: newColor || vwap.color,
          lineWidth: (newLineWidth || vwap.lineWidth) as LineWidth,
        };
        vwap.series?.applyOptions(newOptions);

        setAnchoredVWAPs((prevVWAPs) =>
          prevVWAPs.map((v) =>
            v.id === vwap.id
              ? {
                  ...v,
                  color: newColor || v.color,
                  lineWidth: newLineWidth || v.lineWidth,
                }
              : v
          )
        );

        console.log(
          "Updated VWAP:",
          vwap.id,
          "New color:",
          newColor || vwap.color,
          "New line width:",
          newLineWidth || vwap.lineWidth
        );

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } else {
        console.error("No VWAP provided");
      }
    },
    []
  );

  const handleChartClick = useCallback(
    (param: MouseEventParams) => {
      if (
        (isAddingVWAP ||
          isAddingALWAP ||
          isAddingALWAPLong ||
          isAddingALWAPShort) &&
        chartRef.current
      ) {
        const newVWAP: AnchoredWAP = {
          id: uuidv4(),
          time: param.time as Time,
          series: null,
          data: null,
          color: isAddingVWAP
            ? "rgba(255, 192, 0, 0.8)"
            : isAddingALWAP
            ? "rgba(0, 128, 255, 0.8)"
            : isAddingALWAPLong
            ? "blue"
            : "red",
          lineWidth: 1,
          type: isAddingVWAP
            ? "VWAP"
            : isAddingALWAP
            ? "ALWAP"
            : isAddingALWAPLong
            ? "ALWAP Long"
            : "ALWAP Short",
          crosshairHandler: null,
          div: null,
        };

        setAnchoredVWAPs((prevVWAPs) => {
          if (
            prevVWAPs.some(
              (vwap) => vwap.time === newVWAP.time && vwap.type === newVWAP.type
            )
          ) {
            return prevVWAPs;
          }

          // Calculate and update data based on the type
          if (
            data &&
            data.length > 0 &&
            rektMarkers &&
            rektMarkers.length > 0
          ) {
            let startIndex;
            if (newVWAP.type === "VWAP") {
              startIndex = data.findIndex(
                (item) => Number(item.time) >= Number(newVWAP.time)
              );
            } else {
              startIndex = rektMarkers.findIndex(
                (item) => Number(item.time) >= Number(newVWAP.time)
              );
            }
            if (startIndex !== -1) {
              let lineData;
              console.log("rektmarkers", rektMarkers);
              switch (newVWAP.type) {
                case "VWAP":
                  lineData = calculateVWAPSeriesData(
                    data.slice(startIndex),
                    data[startIndex].time
                  );
                  break;
                case "ALWAP":
                  console.log(rektMarkers[startIndex]);
                  lineData = calculateALWAPSeriesData(
                    rektMarkers.slice(startIndex),
                    rektMarkers[startIndex].time,
                    null
                  );
                  break;
                case "ALWAP Long":
                  lineData = calculateALWAPSeriesData(
                    rektMarkers.slice(startIndex),
                    rektMarkers[startIndex].time,
                    true
                  );
                  break;
                case "ALWAP Short":
                  lineData = calculateALWAPSeriesData(
                    rektMarkers.slice(startIndex),
                    rektMarkers[startIndex].time,
                    false
                  );
                  break;
              }
              newVWAP.data = lineData as VWAPData[];
            }
          }
          return [...prevVWAPs, newVWAP];
        });

        setIsAddingVWAP(false);
        setIsAddingALWAP(false);
        setIsAddingALWAPLong(false);
        setIsAddingALWAPShort(false);
      }
    },
    [
      isAddingVWAP,
      isAddingALWAP,
      isAddingALWAPLong,
      isAddingALWAPShort,
      data,
      rektMarkers,
    ]
  );

  // 3. Modify the existing useEffect that creates VWAP elements
  useEffect(() => {
    if (anchoredVWAPs.length > 0) {
      anchoredVWAPs
        .sort((a, b) => Number(a.time) - Number(b.time))
        .forEach((vwap, index) => {
          const existingElement = document.querySelector(
            `[data-vwap-id="${vwap.id}"]`
          );
          if (existingElement) {
            return;
          }

          const newVWAPElement = (
            <div
              key={vwap.id}
              className="flex items-center justify-between rounded-md bg-transparent hover:bg-gray-800 transition-colors duration-200 w-auto whitespace-nowrap"
              data-vwap-id={vwap.id}
            >
              <span className="text-white text-xs mr-1 ml-1 flex-grow overflow-hidden text-ellipsis">{`${
                vwap.type
              } at ${formatTimeToDate(vwap.time)}`}</span>
              <span className="text-white text-xs vwap-price mr-1"></span>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="text-white text-xs p-1"
                      onClick={() => {
                        setTempColor(vwap.color);
                        setTempLineWidth(vwap.lineWidth);
                      }}
                    >
                      <FaEdit size={10} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4">
                    <div className="space-y-4">
                      <HexColorPicker
                        color={vwap.color}
                        onChange={(e) =>
                          handleVWAPStyleChangeComplete(vwap, e, tempLineWidth)
                        }
                      />
                      <div className="space-y-2">
                        <Label htmlFor="line-width">Line Width</Label>
                        <Input
                          id="line-width"
                          type="number"
                          min={1}
                          max={10}
                          value={vwap.lineWidth}
                          onChange={(e) =>
                            handleVWAPStyleChangeComplete(
                              vwap,
                              vwap.color,
                              Number(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <button
                  className="text-red-500 text-xs p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVWAP(vwap.id);
                  }}
                >
                  <FaTimes size={10} />
                </button>
              </div>
            </div>
          );

          let newElement: HTMLDivElement | null = null;
          const container = chartContainerRef.current;
          if (container) {
            newElement = document.createElement("div");
            newElement.style.position = "absolute";
            // Initial top positioning will be handled by the positioning useEffect
            newElement.style.top = `0px`;
            newElement.style.left = "10px";
            newElement.style.zIndex = "1000";
            newElement.style.display = "block";
            const root = createRoot(newElement);
            root.render(newVWAPElement);
            container.appendChild(newElement);
          }

          const crosshairMoveHandler = (param: {
            point: { x: number; y: number } | undefined;
            time: any;
            seriesData: { get: (arg0: any) => any };
          }) => {
            if (!container || !newElement) return;
            const data = param.seriesData.get(vwap.series);
            if (data) {
              const price = data.value !== undefined ? data.value : 0;
              const priceElement = newElement.querySelector(".vwap-price");
              if (priceElement) {
                priceElement.textContent = price.toFixed(decimalLength);
                (priceElement as HTMLElement).style.color = vwap.color;
                (priceElement as HTMLElement).style.paddingLeft = "8px";
              }
            }
          };

          chartRef.current.subscribeCrosshairMove(crosshairMoveHandler);
          vwap.crosshairHandler = crosshairMoveHandler;
          vwap.div = newVWAPElement;
        });
    }
  }, [
    anchoredVWAPs,
    decimalLength,
    handleColorChange,
    handleDeleteVWAP,
    handleLineWidthChange,
    handleVWAPStyleChangeComplete,
    tempLineWidth,
  ]);

  // Add new anchoredVwaps to the chart
  useEffect(() => {
    if (anchoredVWAPs.length > 0) {
      anchoredVWAPs.forEach((vwap) => {
        setChartSeries((prevChartSeries) => {
          //check if series already exists
          if (prevChartSeries.has(vwap.id)) {
            return prevChartSeries;
          }
          // else add new series to chart and chart series amp
          const newSeries = chartRef.current.addLineSeries({
            color: vwap.color,
            lineWidth: vwap.lineWidth,
            priceLineVisible: false,
            pointMarkersVisible: false,
            lastValueVisible: false,
          });
          if (vwap.data) {
            newSeries.setData(vwap.data);
          }
          prevChartSeries.set(vwap.id, newSeries);
          return prevChartSeries;
        });
      });
    }
  }, [anchoredVWAPs]);

  useEffect(() => {
    if (updatedData && updatedData.length > 0 && anchoredVWAPs.length > 0) {
      // Update vwaps
      anchoredVWAPs.forEach((vwap) => {
        const startIndex = updatedData.findIndex(
          (item) => Number(item.time) >= Number(vwap.time)
        );
        if (startIndex !== -1) {
          const vwapData = calculateVWAPSeriesData(
            updatedData.slice(startIndex),
            updatedData[startIndex].time
          );
          chartSeries.get(vwap.id)?.update(vwapData[vwapData.length - 1]);
        }
      });
    }
  }, [updatedData, anchoredVWAPs, klineData, chartSeries]);

  useEffect(() => {
    if (
      candlestickSeriesRef.current &&
      volumeSeriesRef.current &&
      rektMarkers &&
      rektMarkers.length > 0 &&
      chartRef.current
    ) {
      console.log("rektMarkers", rektMarkers);
      const markersToAdd = [...rektMarkers];

      const lastNewMarker = rektMarkers[rektMarkers.length - 1];
      const lastNewMarkerIntervalStart = getIntervalStartTime(
        Number(lastNewMarker.time),
        filters.interval
      );
      const markers = candlestickSeriesRef.current.markers();
      if (markers.length > 0) {
        const lastMarker = markers[markers.length - 1];
        const lastMarkerIntervalStart = getIntervalStartTime(
          Number(lastMarker.time),
          filters.interval
        );
        if (lastMarkerIntervalStart === lastNewMarkerIntervalStart) {
          markersToAdd.pop();
        }
      }

      markersToAdd.push(lastNewMarker);

      // If topMarkersCount is greater than 0, limit to top markers by value
      const limitedMarkers =
        filters.topMarkersCount > 0
          ? rektMarkers.slice(0, filters.topMarkersCount)
          : rektMarkers;

      const filteredRektMarkers = limitedMarkers.filter((item) => {
        if (markerOption === "both") {
          const hasLong = rektMarkers.some(
            (marker) =>
              marker.time === item.time && marker.position === "aboveBar"
          );
          const hasShort = rektMarkers.some(
            (marker) =>
              marker.time === item.time && marker.position === "belowBar"
          );
          return hasLong && hasShort;
        }
        if (markerOption === "long") {
          return item.position === "aboveBar";
        }
        if (markerOption === "short") {
          return item.position === "belowBar";
        }
        return true; // "all" option
      });

      // Ensure markers are sorted by time
      const sortedMarkers = filteredRektMarkers.sort(
        (a, b) => Number(a.time) - Number(b.time)
      );
      // sorted markers without text
      const sortedMarkersWithoutText = sortedMarkers.map((marker) => {
        return {
          ...marker,
          text: "",
        } as MarkerData;
      });
      candlestickSeriesRef.current.setMarkers(sortedMarkersWithoutText);

      const container = chartContainerRef.current;

      // Create and style the tooltip html element
      const toolTip = document.createElement("div");

      toolTip.style.width = "auto"; // Adjust width to fit content
      toolTip.style.height = "auto"; // Adjust height to fit content
      toolTip.style.position = "absolute";
      toolTip.style.display = "none";
      toolTip.style.boxSizing = "none";
      toolTip.style.fontSize = "12px";
      toolTip.style.textAlign = "left";
      toolTip.style.zIndex = "100";
      toolTip.style.pointerEvents = "none";
      toolTip.style.fontFamily =
        "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";
      toolTip.style.color = "black";
      toolTip.style.borderColor = "#2962FF";

      if (container) {
        container.appendChild(toolTip);
      }

      // Define the crosshair move handler
      const crosshairMoveHandler = (param: {
        point: { x: number; y: number } | undefined;
        time: any;
        seriesData: { get: (arg0: any) => any };
      }) => {
        if (!container) return;
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > container.clientWidth ||
          param.point.y < 0 ||
          param.point.y > container.clientHeight
        ) {
          toolTip.style.display = "none";
        } else {
          toolTip.style.display = "block";
          const data = param.seriesData.get(candlestickSeriesRef.current);
          if (data) {
            // If topMarkersCount is greater than 0, limit to top markers by value
            const limitedMarkers =
              filters.topMarkersCount > 0
                ? sortedMarkers.slice(0, filters.topMarkersCount)
                : sortedMarkers;

            const marker = limitedMarkers.find((m) => m.time === data.time);
            // check threshold and max rekts

            if (!marker) {
              toolTip.style.display = "none";
              return;
            }

            const toolTipWidth = -100;
            const toolTipHeight = marker.position === "aboveBar" ? 80 : -20;
            const toolTipMargin = 1;
            const value = parseFloat(marker.text || "0");

            toolTip.innerHTML = `<div
                className="relative overflow-hidden rounded-md shadow-md transition-transform hover:scale-105"
                style="
                  background-color: ${marker.color};
                  box-shadow: 0 0 5px ${marker.color};
                  padding: 8px;
                  border-radius: 4px;
                  color: white;
                "
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-transparent"></div>
                <div className="relative p-2 text-white">
                  <p className="text-sm font-bold mb-0.5 leading-tight">
                    ${formatCurrency(value, 2)}
                  </p>
                  <p className="text-xs font-bold mb-1 leading-tight">
                    ${formatCurrency(marker.price, 4)}
                  </p>
                  <p className="text-[10px] opacity-75 leading-tight">
                    ${new Date(Number(marker.time) * 1000).toLocaleString(
                      "en-US",
                      {
                        timeZone: "UTC",
                      }
                    )}
                  </p>
                </div>
              </div>`;

            const coordinate = candlestickSeriesRef.current.priceToCoordinate(
              marker.price
            );
            let shiftedCoordinate = param.point.x - 50;
            if (coordinate === null) {
              return;
            }
            shiftedCoordinate = Math.max(
              0,
              Math.min(
                container.clientWidth - toolTipWidth,
                shiftedCoordinate
              ) - 100
            );
            const coordinateY =
              coordinate - toolTipHeight - toolTipMargin > 0
                ? coordinate - toolTipHeight - toolTipMargin
                : Math.max(
                    0,
                    Math.min(
                      container.clientHeight - toolTipHeight - toolTipMargin,
                      coordinate + toolTipMargin
                    )
                  );
            toolTip.style.left = shiftedCoordinate + "px";
            toolTip.style.top = coordinateY + "px";
          }
        }
      };

      // Subscribe the new handler
      chartRef.current.subscribeCrosshairMove(crosshairMoveHandler);
      // chartRef.current.subscribeClick(handleChartClick);

      // Cleanup function
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeCrosshairMove(crosshairMoveHandler);
        }
        if (container && toolTip) {
          container.removeChild(toolTip);
        }
      };
    }
  }, [
    rektMarkers,
    filters.interval,
    filters.topMarkersCount,
    filters.allowAlertToasts,
    handleChartClick,
    markerOption,
    showHigherAboveBarMarkers,
    showLowerBelowBarMarkers,
    checkAboveBarValue,
    checkBelowBarValue,
  ]);
  const renderWebSocketStatus = () => {
    if (wsStatus === "connected") {
      return (
        <div className="flex items-center gap-2 text-green-500 text-xs w-full">
          <span>KLine Data</span>
          <FaCheckCircle />
        </div>
      );
    } else if (wsStatus === "connecting") {
      return (
        <div className="flex items-center gap-2 text-yellow-500 text-xs w-full">
          <span>WebSocket</span>
          <FaSpinner className="animate-spin" />
        </div>
      );
    } else if (wsStatus === "error" || wsStatus === "disconnected") {
      return (
        <div className="flex items-center gap-2 text-red-500 text-xs w-full">
          <FaExclamationTriangle />
          <span>WebSocket Error{wsError ? `: ${wsError}` : ""}</span>
        </div>
      );
    }

    return null;
  };
  const renderRektWebSocketStatus = () => {
    if (rektWsStatus === "connected") {
      return (
        <div className="flex items-center text-green-500 text-xs w-full whitespace-nowrap -mt-2">
          <FaCheckCircle className="mr-2" />
          <span>Rekt WebSocket Connected</span>
        </div>
      );
    } else if (rektWsStatus === "connecting") {
      return (
        <div className="flex items-center text-yellow-500 text-xs w-full whitespace-nowrap -mt-2">
          <FaSpinner className="animate-spin mr-2" />
          <span>Rekt WebSocket Connecting...</span>
        </div>
      );
    } else if (rektWsStatus === "error") {
      return (
        <div className="flex items-center text-red-500 text-xs w-full whitespace-nowrap -mt-2">
          <FaExclamationTriangle className="mr-2" />
          <span>
            Rekt WebSocket Error{rektWsStatus ? `: ${rektWsStatus}` : ""}
          </span>
        </div>
      );
    }

    return null;
  };
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isAddingVWAP) {
        setIsAddingVWAP(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isAddingVWAP]);
  useEffect(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.style.cursor = isAddingVWAP
        ? "crosshair"
        : "default";
    }
  }, [isAddingVWAP]);
  // Add this effect to subscribe/unsubscribe to chart clicks
  useEffect(() => {
    if (chartRef.current && isAddingVWAP) {
      chartRef.current.subscribeClick(handleChartClick);
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeClick(handleChartClick);
        }
      };
    }
  }, [isAddingVWAP, handleChartClick]);

  const handleAddTop5VWAPs = useCallback(() => {
    const top5Markers = [...rektMarkers]
      .sort((a, b) => Number(b.text) - Number(a.text))
      .slice(0, 5);

    top5Markers.forEach((marker) => {
      if (!anchoredVWAPs.some((vwap) => vwap.time === marker.time)) {
        const newVWAP: AnchoredWAP = {
          id: uuidv4(),
          time: marker.time,
          series: null,
          data: null,
          color: "orange",
          lineWidth: 2,
          type: "VWAP",
          crosshairHandler: null,
          div: null,
        };

        if (data) {
          const startIndex = data.findIndex(
            (item) => Number(item.time) >= Number(marker.time)
          );
          if (startIndex !== -1) {
            const vwapData = calculateVWAPSeriesData(
              data.slice(startIndex),
              data[startIndex].time
            );
            newVWAP.data = vwapData as VWAPData[];
          }
        }

        setAnchoredVWAPs((prev) => [...prev, newVWAP]);
      }
    });
  }, [rektMarkers, anchoredVWAPs, data]);

  // Handler to add Individual ALWAP Long

  const handleAddALWAP = useCallback(() => {
    console.log("handleAddALWAP");
    setIsAddingALWAP(true);
  }, []);
  const handleAddALWAPLong = useCallback(() => {
    console.log("handleAddALWAPLong");
    setIsAddingALWAPLong(true);
  }, []);

  // Handler to add Individual ALWAP Short
  const handleAddALWAPShort = useCallback(() => {
    console.log("handleAddALWAPShort");
    setIsAddingALWAPShort(true);
  }, []);

  // Subscribe to ALWAP Long chart clicks
  useEffect(() => {
    if (chartRef.current && isAddingALWAP) {
      chartRef.current.subscribeClick(handleChartClick);
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeClick(handleChartClick);
        }
      };
    }
  }, [isAddingALWAP, handleChartClick]);

  useEffect(() => {
    if (chartRef.current && isAddingALWAPLong) {
      chartRef.current.subscribeClick(handleChartClick);
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeClick(handleChartClick);
        }
      };
    }
  }, [isAddingALWAPLong, handleChartClick]);

  // Subscribe to ALWAP Short chart clicks
  useEffect(() => {
    if (chartRef.current && isAddingALWAPShort) {
      chartRef.current.subscribeClick(handleChartClick);
      return () => {
        if (chartRef.current) {
          chartRef.current.unsubscribeClick(handleChartClick);
        }
      };
    }
  }, [isAddingALWAPShort, handleChartClick]);

  // Function to format time to a readable date string
  const formatTimeToDate = (time: Time): string => {
    const date = new Date(Number(time) * 1000); // Convert to milliseconds
    return date.toLocaleString(); // Customize the format as needed
  };

  // Add these functions back
  const handleAddTop5ALWAPs = useCallback(() => {
    const top5Markers = [...rektMarkers]
      .sort((a, b) => Number(b.text) - Number(a.text))
      .slice(0, 5);

    top5Markers.forEach((marker) => {
      if (
        !anchoredVWAPs.some(
          (vwap) => vwap.time === marker.time && vwap.type === "ALWAP"
        )
      ) {
        const newALWAP: AnchoredWAP = {
          id: uuidv4(),
          time: marker.time,
          series: null,
          data: null,
          color: "purple",
          lineWidth: 2,
          type: "ALWAP",
          crosshairHandler: null,
          div: null,
        };

        if (rektMarkers) {
          const startIndex = rektMarkers.findIndex(
            (item) => Number(item.time) >= Number(marker.time)
          );
          if (startIndex !== -1) {
            const alwapData = calculateALWAPSeriesData(
              rektMarkers.slice(startIndex),
              rektMarkers[startIndex].time,
              true
            );
            newALWAP.data = alwapData as VWAPData[];
          }
        }

        setAnchoredVWAPs((prev) => [...prev, newALWAP]);
      }
    });
  }, [rektMarkers, anchoredVWAPs]);

  const handleAddTop5ALWAPLongs = useCallback(() => {
    const top5LongMarkers = [...rektMarkers]
      .filter((marker) => marker.position === "aboveBar")
      .sort((a, b) => Number(b.text) - Number(a.text))
      .slice(0, 5);

    top5LongMarkers.forEach((marker) => {
      if (
        !anchoredVWAPs.some(
          (vwap) => vwap.time === marker.time && vwap.type === "ALWAP Long"
        )
      ) {
        const newALWAPLong: AnchoredWAP = {
          id: uuidv4(),
          time: marker.time,
          // series: chartRef.current?.addLineSeries({
          //   color: marker.color,
          //   lineWidth: 2,
          //   priceLineVisible: false,
          //   pointMarkersVisible: false,
          //   lastValueVisible: false,
          // }) as ISeriesApi<"Line">,
          series: null,
          data: null,
          color: marker.color,
          lineWidth: 2,
          type: "ALWAP Long",
          crosshairHandler: null,
          div: null,
        };

        if (rektMarkers) {
          const startIndex = rektMarkers.findIndex(
            (item) => Number(item.time) >= Number(marker.time)
          );
          if (startIndex !== -1) {
            const alwapLongData = calculateALWAPSeriesData(
              rektMarkers.slice(startIndex),
              rektMarkers[startIndex].time,
              true
            );
            newALWAPLong.data = alwapLongData as VWAPData[];
          }
        }

        setAnchoredVWAPs((prev) => [...prev, newALWAPLong]);
      }
    });
  }, [rektMarkers, anchoredVWAPs]);

  useEffect(() => {
    const adjustVWAPPositions = () => {
      console.log("adjustVWAPPositions");
      const container = chartContainerRef.current;
      if (!container) return;
      const indicatorsButton = indicatorsButtonRef.current;
      if (!indicatorsButton) return;

      const vwapElements = container.querySelectorAll("[data-vwap-id]");
      vwapElements.forEach((element, index) => {
        if (showVWAPElements) {
          console.log("showVWAPElements", showVWAPElements);
          const vwapElement = element as HTMLElement;
          vwapElement.style.position = "absolute";
          vwapElement.style.top = `${index * 24 + 12}px`; // Reduced spacing between items
          vwapElement.style.height = "auto";
          vwapElement.style.width = "auto";
          vwapElement.style.left = "10px";
          // vwapElement.style.zIndex = "1000";
          vwapElement.style.display = "flex";
          vwapElement.style.alignItems = "center";
          vwapElement.style.maxWidth = "300px";
          vwapElement.style.overflow = "hidden";
          vwapElement.style.textOverflow = "ellipsis";
          vwapElement.style.whiteSpace = "nowrap";
          vwapElement.style.fontSize = "11px"; // Slightly smaller font size
          vwapElement.style.padding = "2px 4px"; // Reduced padding

          // edit the button position
          indicatorsButton.style.top = `${index * 24 + 60}px`;
        } else {
          console.log("showVWAPElements", showVWAPElements);
          const vwapElement = element as HTMLElement;
          vwapElement.style.position = "absolute";
          vwapElement.style.height = "0px";
          vwapElement.style.width = "0px";
          vwapElement.style.top = "0px"; // Reduced spacing between items
          vwapElement.style.left = "0px";
          // vwapElement.style.zIndex = "1000";
          vwapElement.style.display = "flex";
          vwapElement.style.maxWidth = "0px";
          vwapElement.style.padding = "0px 0px"; // Reduced padding
          indicatorsButton.style.top = "40px";
        }
      });
    };

    // Run the adjustment after a short delay to ensure elements are rendered
    const timeoutId = setTimeout(adjustVWAPPositions, 10);

    // Clean up the timeout on component unmount
    return () => clearTimeout(timeoutId);
  }, [anchoredVWAPs, showVWAPElements]);

  const handleAddTop5VolumeVWAPs = useCallback(() => {
    if (!data) return;

    const top5VolumeCandles = [...data]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    top5VolumeCandles.forEach((candle) => {
      if (!anchoredVWAPs.some((vwap) => vwap.time === candle.time)) {
        const newVWAP: AnchoredWAP = {
          id: uuidv4(),
          time: candle.time,
          // series: chartRef.current?.addLineSeries({
          //   color: "green", // Set VWAP line color to green
          //   lineWidth: 2,
          //   priceLineVisible: false,
          //   pointMarkersVisible: false,
          //   lastValueVisible: false,
          // }) as ISeriesApi<"Line">,
          series: null,
          data: null,
          color: "green",
          lineWidth: 2,
          type: "VWAP",
          crosshairHandler: null,
          div: null,
        };

        const startIndex = data.findIndex(
          (item) => Number(item.time) >= Number(candle.time)
        );
        if (startIndex !== -1) {
          const vwapData = calculateVWAPSeriesData(
            data.slice(startIndex),
            data[startIndex].time
          );
          newVWAP.data = vwapData as VWAPData[];
        }

        setAnchoredVWAPs((prev) => [...prev, newVWAP]);
      }
    });
  }, [data, anchoredVWAPs]);

  // Add these new state variables inside the RektChart component
  const [pivotHighs, setPivotHighs] = useState<number[]>([]);
  const [pivotLows, setPivotLows] = useState<number[]>([]);

  // Add these new state variables
  const [pivotHighLeftLen, setPivotHighLeftLen] = useState(100);
  const [pivotHighRightLen, setPivotHighRightLen] = useState(100);
  const [pivotLowLeftLen, setPivotLowLeftLen] = useState(100);
  const [pivotLowRightLen, setPivotLowRightLen] = useState(100);

  // Update the updatePivotPoints function
  const updatePivotPoints = useCallback(() => {
    if (data && data.length > 0) {
      const { highs, lows } = findPivotPoints(
        data,
        pivotHighLeftLen,
        pivotHighRightLen
      );
      setPivotHighs(highs);
      const { highs: _, lows: lowPivots } = findPivotPoints(
        data,
        pivotLowLeftLen,
        pivotLowRightLen
      );
      setPivotLows(lowPivots);
    }
  }, [
    data,
    pivotHighLeftLen,
    pivotHighRightLen,
    pivotLowLeftLen,
    pivotLowRightLen,
  ]);

  // Update the useEffect to include the new dependencies
  useEffect(() => {
    updatePivotPoints();
  }, [
    data,
    updatePivotPoints,
    pivotHighLeftLen,
    pivotHighRightLen,
    pivotLowLeftLen,
    pivotLowRightLen,
  ]);

  // Update the handleAddPivotHighVWAPs and handleAddPivotLowVWAPs functions
  const handleAddPivotHighVWAPs = useCallback(() => {
    if (!data) return;
    pivotHighs.forEach((index) => {
      const pivotPoint = data[index];
      if (
        pivotPoint &&
        !anchoredVWAPs.some((vwap) => vwap.time === pivotPoint.time)
      ) {
        const newVWAP: AnchoredWAP = {
          id: uuidv4(),
          time: pivotPoint.time,
          series: null,
          data: null,
          color: "yellow",
          lineWidth: 2,
          type: "VWAP",
          crosshairHandler: null,
          div: null,
        };

        if (data) {
          const vwapData = calculateVWAPSeriesData(
            data.slice(index),
            pivotPoint.time
          );
          newVWAP.data = vwapData as VWAPData[];
        }

        setAnchoredVWAPs((prev) => [...prev, newVWAP]);
      }
    });
  }, [pivotHighs, data, anchoredVWAPs]);

  const handleAddPivotLowVWAPs = useCallback(() => {
    if (!data) return;
    pivotLows.forEach((index) => {
      const pivotPoint = data[index];
      if (
        pivotPoint &&
        !anchoredVWAPs.some((vwap) => vwap.time === pivotPoint.time)
      ) {
        const newVWAP: AnchoredWAP = {
          id: uuidv4(),
          time: pivotPoint.time,
          series: null,
          data: null,
          color: "cyan",
          lineWidth: 2,
          type: "VWAP",
          crosshairHandler: null,
          div: null,
        };

        if (data) {
          const vwapData = calculateVWAPSeriesData(
            data.slice(index),
            pivotPoint.time
          );
          newVWAP.data = vwapData as VWAPData[];
        }

        setAnchoredVWAPs((prev) => [...prev, newVWAP]);
      }
    });
  }, [pivotLows, data, anchoredVWAPs]);

  return (
    <div className="w-auto h-auto relative bg-[#1e222d] border-b border-[#2a2e39]">
      <div className="flex-shrink-0">
        <SettingsCard
          filters={filters}
          setFilters={setFilters}
          rektMarkers={rektMarkers}
          showVolume={showVolume}
          setShowVolume={setShowVolume}
          showOpenInterest={showOpenInterest}
          setShowOpenInterest={setShowOpenInterest}
          showTopLongShortRatio={showTopLongShortRatio}
          setShowTopLongShortRatio={setShowTopLongShortRatio}
          showLongAccount={showLongAccount}
          setShowLongAccount={setShowLongAccount}
          showShortAccount={showShortAccount}
          setShowShortAccount={setShowShortAccount}
          handleAddVWAP={handleAddVWAP}
          handleAddTop5VWAPs={handleAddTop5VWAPs}
          handleAddALWAP={handleAddALWAP}
          handleAddTop5ALWAPs={handleAddTop5ALWAPs}
          handleAddALWAPLong={handleAddALWAPLong}
          handleAddTop5ALWAPLongs={handleAddTop5ALWAPLongs}
          handleAddALWAPShort={handleAddALWAPShort}
          handleAddTop5ALWAPShorts={handleAddALWAPShort}
          isAddingVWAP={isAddingVWAP}
          isAddingALWAPLong={isAddingALWAPLong}
          isAddingALWAPShort={isAddingALWAPShort}
          markerOption={markerOption}
          setMarkerOption={setMarkerOption}
          handleAddTop5VolumeVWAPs={handleAddTop5VolumeVWAPs}
          handleAddPivotHighVWAPs={handleAddPivotHighVWAPs}
          handleAddPivotLowVWAPs={handleAddPivotLowVWAPs}
          pivotHighLeftLen={pivotHighLeftLen}
          pivotHighRightLen={pivotHighRightLen}
          pivotLowLeftLen={pivotLowLeftLen}
          pivotLowRightLen={pivotLowRightLen}
          setPivotHighLeftLen={setPivotHighLeftLen}
          setPivotHighRightLen={setPivotHighRightLen}
          setPivotLowLeftLen={setPivotLowLeftLen}
          setPivotLowRightLen={setPivotLowRightLen}
        />
      </div>
      {/* Chart Container */}
      <div className="w-full h-full flex justify-start relative">
        <div className="flex-grow relative" ref={chartContainerRef}>
          {isLoading && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
              <BeatLoader color="#36D7B7" />
            </div>
          )}
          {isError !== "" && (
            <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
              <FaExclamationTriangle className="text-yellow-500 mr-2" />
              <span className="text-red-500">Error: {isError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Button to toggle VWAP elements visibility */}
      {anchoredVWAPs.length > 0 && (
        <div
          className="absolute pl-2 pt-2 z-20"
          ref={indicatorsButtonRef}
          style={{ top: `20px`, left: `10px` }}
        >
          <Button
            onClick={toggleVWAPElements}
            className="bg-transparent flex items-center space-x-1 hover:bg-gray-800 h-4 w-8"
          >
            {showVWAPElements ? (
              <FaChevronUp className="text-[8px] text-gray-300 -mx-2 -mt-1 -mb-1" />
            ) : (
              <FaChevronDown className="text-[8px] text-gray-300 -mx-2 -mt-1 -mb-1" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RektChart;
