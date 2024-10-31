import {
  SeriesMarker,
  SeriesMarkerPosition,
  SeriesMarkerShape,
  CandlestickData,
  Time,
  ISeriesApi,
} from "lightweight-charts";
import { Dispatch, SetStateAction } from "react";

export interface RektData {
  id: string;
  symbol: string;
  time: Time;
  date: string;
  value: number;
  price: number;
  quantity: number;
  position: string;
}

export interface ChartSectionProps {
  state: {
    symbol: string;
    minRektAmount: number;
    interval: string;
  };
  markers: SeriesMarker<Time>[];
  markersLoading: boolean;
  markersError: string | null;
  RektWsStatus: string;
  RektWsError: string | null;
  newMarkers: SeriesMarker<Time>[];
}

export interface WebSocketCallbacks {
  onOpen: () => void;
  onClose: () => void;
  onError: (error: Event) => void;
}

export interface Filters {
  symbol: string;
  percentiles: number[];
  interval: string;
  topMarkersCount: number;
  allowAlertToasts: boolean; // New property
  showHigherAboveBarMarkers: boolean;
  showLowerAboveBarMarkers: boolean;
  showHigherBelowBarMarkers: boolean;
  showLowerBelowBarMarkers: boolean;
  checkAboveBarValue: number;
  checkBelowBarValue: number;
  higherAboveBarColor: string;
  lowerAboveBarColor: string;
  higherBelowBarColor: string;
  lowerBelowBarColor: string;
}

export interface SettingsCardProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  rektMarkers: MarkerData[];
  showVolume: boolean;
  setShowVolume: Dispatch<SetStateAction<boolean>>;
  showOpenInterest: boolean;
  setShowOpenInterest: Dispatch<SetStateAction<boolean>>;
  showTopLongShortRatio: boolean;
  setShowTopLongShortRatio: Dispatch<SetStateAction<boolean>>;
  showLongAccount: boolean;
  setShowLongAccount: Dispatch<SetStateAction<boolean>>;
  showShortAccount: boolean;
  setShowShortAccount: Dispatch<SetStateAction<boolean>>;
  handleAddVWAP: () => void;
  handleAddTop5VWAPs: () => void;
  handleAddALWAP: () => void;
  handleAddTop5ALWAPs: () => void;
  handleAddALWAPLong: () => void;
  handleAddTop5ALWAPLongs: () => void;
  handleAddALWAPShort: () => void;
  handleAddTop5ALWAPShorts: () => void;
  isAddingVWAP: boolean;
  isAddingALWAPLong: boolean;
  isAddingALWAPShort: boolean;
  markerOption: string;
  setMarkerOption: (value: string) => void;
  handleAddTop5VolumeVWAPs: () => void;
  handleAddPivotHighVWAPs: () => void;
  handleAddPivotLowVWAPs: () => void;
  pivotHighLeftLen: number;
  pivotHighRightLen: number;
  pivotLowLeftLen: number;
  pivotLowRightLen: number;
  setPivotHighLeftLen: (value: number) => void;
  setPivotHighRightLen: (value: number) => void;
  setPivotLowLeftLen: (value: number) => void;
  setPivotLowRightLen: (value: number) => void;
}

export class MarkerData {
  symbol: string;
  time: Time;
  position: SeriesMarkerPosition;
  color: string;
  shape: SeriesMarkerShape;
  text: string;
  price: number; // Add price property

  constructor(
    symbol: string,
    time: Time,
    position: SeriesMarkerPosition,
    color: string,
    shape: SeriesMarkerShape,
    text: string,
    price: number // Add price parameter
  ) {
    // time should be - 4 hours
    this.symbol = symbol;
    this.time = (Number(time) - 4 * 60 * 60) as Time;
    this.position = position;
    this.color = color;
    this.shape = shape;
    this.text = text;
    this.price = price; // Set price
  }
}

export interface HistoricalData {
  candlesticks: CandlestickData<Time>[];
  volume: VolumeData[];
}
export interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

export interface KlineData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color: string;
}

export interface VWAPData {
  time: Time;
  value: number | null;
}

export interface AnchoredWAP {
  id: string;
  time: Time;
  series: ISeriesApi<"Line"> | null; // Changed from 'any' to 'ISeriesApi<"Line">'
  data: VWAPData[] | null;
  color: string;
  lineWidth: number;
  type: "VWAP" | "ALWAP" | "ALWAP Long" | "ALWAP Short";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  crosshairHandler: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  div: any;
}

export interface OpenInterestStatisticsData {
  symbol: string;
  sumOpenInterest: number;
  sumOpenInterestValue: number;
  timestamp: Time;
}

export interface OpenInterestData {
  symbol: string;
  openInterest: number;
  time: Time;
}

export interface TopLongShortPositionRatioData {
  symbol: string;
  longShortRatio: number;
  longAccount: number;
  shortAccount: number;
  timestamp: Time;
}
