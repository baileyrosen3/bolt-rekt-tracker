import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Filters, MarkerData, SettingsCardProps } from "../utils/types";
import { Switch } from "./ui/switch";
import { DualRangeSlider } from "./ui/dual-range-slider";
import { useEffect, useState, useCallback } from "react";
import { MoreVertical } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar";
import { Button } from "./ui/button";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { Input } from "./ui/input";

const availableSymbols = [
  "AVAXUSDT",
  "1000BONKUSDT",
  "BTCUSDT",
  "DOGEUSDT",
  "ETHUSDT",
  "1000FLOKIUSDT",
  "FTMUSDT",
  "INJUSDT",
  "JUPUSDT",
  "KASUSDT",
  "NEARUSDT",
  "ONDOUSDT",
  "1000PEPEUSDT",
  "POPCATUSDT",
  "PYTHUSDT",
  "SEIUSDT",
  "SOLUSDT",
  "SUIUSDT",
  "TAOUSDT",
  "TIAUSDT",
  "WIFUSDT",
  "TONUSDT",
];

const availableIntervals = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w",
  "1M",
];

export default function ModernSettingsCard({
  filters: state,
  setFilters,
  rektMarkers,
  showVolume,
  setShowVolume,
  showOpenInterest,
  setShowOpenInterest,
  showTopLongShortRatio,
  setShowTopLongShortRatio,
  showLongAccount,
  setShowLongAccount,
  showShortAccount,
  setShowShortAccount,
  handleAddVWAP,
  handleAddTop5VWAPs,
  handleAddALWAP,
  handleAddTop5ALWAPs,
  handleAddALWAPLong,
  handleAddTop5ALWAPLongs,
  handleAddALWAPShort,
  handleAddTop5ALWAPShorts,
  isAddingVWAP,
  isAddingALWAPLong,
  isAddingALWAPShort,
  markerOption,
  setMarkerOption,
  handleAddTop5VolumeVWAPs,
  // handleAddMidas,
  handleAddPivotHighVWAPs,
  handleAddPivotLowVWAPs,
  pivotHighLeftLen,
  pivotHighRightLen,
  pivotLowLeftLen,
  pivotLowRightLen,
  setPivotHighLeftLen,
  setPivotHighRightLen,
  setPivotLowLeftLen,
  setPivotLowRightLen,
}: SettingsCardProps): React.ReactElement {
  const inputClass =
    "h-8 text-xs bg-[#1e222d] border-[#2a2e39] border-r-0 focus:ring-0 focus:border-[#2a2e39] rounded-none";

  const handleSymbolChange = (value: string) => {
    setFilters((prev: Filters) => ({ ...prev, symbol: value }));
  };

  const handleIntervalChange = (value: string) => {
    setFilters((prev: Filters) => ({ ...prev, interval: value }));
  };

  const [rektMarkersList, setRektMarkersList] = useState<MarkerData[]>([]);

  useEffect(() => {
    setRektMarkersList(rektMarkers);
  }, [rektMarkers]);

  const handleThresholdChange = (values: number[]) => {
    setFilters((prev: Filters) => ({ ...prev, percentiles: values }));
  };

  const handleAlertToggle = (checked: boolean) => {
    setFilters((prev: Filters) => ({ ...prev, allowAlertToasts: checked }));
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const preventClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="flex items-center bg-[#1e222d] border-b border-[#2a2e39] z-100 h-[32px]">
      <div className="flex items-center">
        <Select value={state.symbol} onValueChange={handleSymbolChange}>
          <SelectTrigger
            className={`w-[120px] ${inputClass} border-l border-r`}
          >
            <SelectValue placeholder="Symbol" />
          </SelectTrigger>
          <SelectContent>
            {availableSymbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.interval} onValueChange={handleIntervalChange}>
          <SelectTrigger
            className={`w-[60px] ${inputClass} border-l-0 border-r`}
          >
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            {availableIntervals.map((interval) => (
              <SelectItem key={interval} value={interval}>
                {interval}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        <Menubar className="bg-transparent border-none">
          <MenubarMenu>
            <MenubarTrigger
              className="p-2 text-white hover:bg-gray-800 rounded-md"
              onClick={handleMenuToggle}
            >
              <span className="mr-1">Settings</span>
              <MoreVertical className="h-4 w-4 inline-block" />
            </MenubarTrigger>
            {isMenuOpen && (
              <MenubarContent
                onPointerDownOutside={() => setIsMenuOpen(false)}
                onEscapeKeyDown={() => setIsMenuOpen(false)}
                className="menubar-content"
              >
                <MenubarSub>
                  <MenubarSubTrigger onPointerDown={preventClose}>
                    Marker Filters
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarSub>
                      <MenubarSubTrigger onPointerDown={preventClose}>
                        Rekt Range
                      </MenubarSubTrigger>
                      <MenubarSubContent className="w-[300px] h-[100px] pl-8 pr-8">
                        <div
                          className="flex flex-col items-center justify-center h-full"
                          onPointerDown={preventClose}
                        >
                          <span className="text-sm font-semibold mb-2 -mt-8">
                            Rekt Range
                          </span>
                          <DualRangeSlider
                            label={(value) => {
                              if (
                                value === undefined ||
                                rektMarkersList === undefined ||
                                rektMarkersList.length === 0
                              )
                                return <span>0</span>;
                              const sortedMarkers = [...rektMarkersList].sort(
                                (a, b) => Number(a.text) - Number(b.text)
                              );
                              const index = Math.floor(
                                (value / 100) * (sortedMarkers.length - 1)
                              );
                              const markerValue = sortedMarkers[index];
                              return (
                                <span className="text-xs">
                                  ${Number(markerValue.text).toFixed(2)}
                                </span>
                              );
                            }}
                            value={state.percentiles}
                            onValueChange={handleThresholdChange}
                            min={0}
                            max={100}
                            step={1}
                            labelPosition="bottom"
                            className="w-full -mb-2"
                          />
                        </div>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <Select
                        onValueChange={(value) => {
                          setMarkerOption(value);
                        }}
                        defaultValue={markerOption}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                      <MenubarSubTrigger>Bullish Trend</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem
                          onSelect={(event: Event) =>
                            preventClose(event as unknown as React.MouseEvent)
                          }
                        >
                          <div
                            className="flex items-center justify-between w-full"
                            onPointerDown={(event: React.PointerEvent) =>
                              preventClose(event)
                            }
                          >
                            <div className="flex items-center">
                              <Switch
                                id="show-higher-abovebar-markers"
                                checked={state.showHigherAboveBarMarkers}
                                onCheckedChange={(checked) => {
                                  setFilters((prev: Filters) => ({
                                    ...prev,
                                    showHigherAboveBarMarkers: checked,
                                  }));
                                }}
                              />
                              <div onPointerDown={(e) => e.stopPropagation()}>
                                <Input
                                  type="number"
                                  value={state.checkAboveBarValue} // Convert to string
                                  onChange={(e) =>
                                    setFilters((prev: Filters) => ({
                                      ...prev,
                                      checkAboveBarValue: Number(
                                        e.target.value
                                      ),
                                    }))
                                  }
                                  className="ml-2 w-16 text-xs bg-[#1e222d] border-[#2a2e39] rounded"
                                />
                              </div>
                            </div>
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Trend</span>
                            <Input
                              type="color"
                              value={state.higherAboveBarColor || "#ff6969"} // Default to the desired color if state.higherAboveBarColor is black or empty
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  higherAboveBarColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 p-0 border-none"
                            />
                          </div>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>No Trend</span>
                            <Input
                              type="color"
                              value={state.lowerAboveBarColor}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  lowerAboveBarColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 p-0 border-none"
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Show No Trend</span>
                            <Switch
                              id="show-lower-above-bar-markers"
                              checked={state.showLowerAboveBarMarkers}
                              onCheckedChange={(checked) => {
                                setFilters((prev: Filters) => ({
                                  ...prev,
                                  showLowerAboveBarMarkers: checked,
                                }));
                              }}
                            />
                          </div>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>

                    <MenubarSub>
                      <MenubarSubTrigger>Bearish Trend</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem
                          onSelect={(event: Event) =>
                            preventClose(event as unknown as React.MouseEvent)
                          }
                        >
                          <div
                            className="flex items-center justify-between w-full"
                            onPointerDown={(event: React.PointerEvent) =>
                              preventClose(event)
                            }
                          >
                            <div className="flex items-center">
                              <Switch
                                id="show-lower-belowbar-markers"
                                checked={state.showLowerBelowBarMarkers}
                                onCheckedChange={(checked) => {
                                  setFilters((prev: Filters) => ({
                                    ...prev,
                                    showLowerBelowBarMarkers: checked,
                                  }));
                                }}
                              />
                              <div onPointerDown={(e) => e.stopPropagation()}>
                                <Input
                                  type="number"
                                  value={state.checkBelowBarValue} // Convert to string
                                  onChange={(e) => {
                                    const value = Math.max(
                                      0,
                                      Number(e.target.value)
                                    );
                                    setFilters((prev: Filters) => ({
                                      ...prev,
                                      checkBelowBarValue: value,
                                    }));
                                  }}
                                  className="ml-2 w-16 text-xs bg-[#1e222d] border-[#2a2e39] rounded"
                                />
                              </div>
                            </div>
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Trend</span>
                            <Input
                              type="color"
                              value={state.higherBelowBarColor}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  higherBelowBarColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 p-0 border-none"
                            />
                          </div>
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>No Trend</span>
                            <Input
                              type="color"
                              value={state.lowerBelowBarColor}
                              onChange={(e) =>
                                setFilters((prev) => ({
                                  ...prev,
                                  lowerBelowBarColor: e.target.value,
                                }))
                              }
                              className="w-8 h-8 p-0 border-none"
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Show No Trend</span>
                            <Switch
                              id="show-higher-below-bar-markers"
                              checked={state.showHigherBelowBarMarkers}
                              onCheckedChange={(checked) => {
                                setFilters((prev: Filters) => ({
                                  ...prev,
                                  showHigherBelowBarMarkers: checked,
                                }));
                              }}
                            />
                          </div>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger onPointerDown={preventClose}>
                    Indicators
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <div
                        className="flex items-center justify-between w-full"
                        onPointerDown={(event: React.PointerEvent) =>
                          preventClose(event)
                        }
                      >
                        <span>Volume</span>
                        <Switch
                          id="show-volume"
                          checked={showVolume}
                          onCheckedChange={(checked) => {
                            setShowVolume(checked);
                          }}
                        />
                      </div>
                    </MenubarItem>
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <div
                        className="flex items-center justify-between w-full"
                        onPointerDown={(event: React.PointerEvent) =>
                          preventClose(event)
                        }
                      >
                        <span>Open Interest</span>
                        <Switch
                          id="show-open-interest"
                          checked={showOpenInterest}
                          onCheckedChange={(checked) => {
                            setShowOpenInterest(checked);
                          }}
                        />
                      </div>
                    </MenubarItem>
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <div
                        className="flex items-center justify-between w-full"
                        onPointerDown={(event: React.PointerEvent) =>
                          preventClose(event)
                        }
                      >
                        <span>Top L/S Ratio</span>
                        <Switch
                          id="show-top-long-short-ratio"
                          checked={showTopLongShortRatio}
                          onCheckedChange={(checked) => {
                            setShowTopLongShortRatio(checked);
                          }}
                        />
                      </div>
                    </MenubarItem>
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <div
                        className="flex items-center justify-between w-full"
                        onPointerDown={(event: React.PointerEvent) =>
                          preventClose(event)
                        }
                      >
                        <span>Long Account</span>
                        <Switch
                          id="show-long-account"
                          checked={showLongAccount}
                          onCheckedChange={(checked) => {
                            setShowLongAccount(checked);
                          }}
                        />
                      </div>
                    </MenubarItem>
                    <MenubarItem
                      onSelect={(event: Event) =>
                        preventClose(event as unknown as React.MouseEvent)
                      }
                    >
                      <div
                        className="flex items-center justify-between w-full"
                        onPointerDown={(event: React.PointerEvent) =>
                          preventClose(event)
                        }
                      >
                        <span>Short Account</span>
                        <Switch
                          id="show-short-account"
                          checked={showShortAccount}
                          onCheckedChange={(checked) => {
                            setShowShortAccount(checked);
                          }}
                        />
                      </div>
                    </MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />

                <MenubarSub>
                  <MenubarSubTrigger onPointerDown={preventClose}>
                    VWAPs
                  </MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarSub>
                      <MenubarSubTrigger onPointerDown={preventClose}>
                        AVWAP
                      </MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isAddingVWAP ? "bg-green-500" : "bg-orange-500"
                            } text-white w-full justify-start`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddVWAP();
                            }}
                          >
                            {isAddingVWAP ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaPlus className="mr-1" />
                            )}
                            Add AVWAP
                          </Button>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-orange-500 text-white w-full justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTop5VWAPs();
                            }}
                          >
                            Top 5 Rekt AVWAPs
                          </Button>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-orange-500 text-white w-full justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTop5VolumeVWAPs();
                            }}
                          >
                            Top 5 Vol AVWAPs
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                      <MenubarSubTrigger>ALVWAP</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isAddingALWAPLong
                                ? "bg-green-500"
                                : "bg-purple-500"
                            } text-white w-full justify-start`}
                            onClick={handleAddALWAP}
                          >
                            {isAddingALWAPLong ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaPlus className="mr-1" />
                            )}
                            Add ALVWAP
                          </Button>
                        </MenubarItem>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-500 text-white w-full justify-start"
                            onClick={handleAddTop5ALWAPs}
                          >
                            Top 5 ALVWAPs
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                      <MenubarSubTrigger>ALVWAP Long</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isAddingALWAPLong ? "bg-green-500" : "bg-blue-500"
                            } text-white w-full justify-start`}
                            onClick={handleAddALWAPLong}
                          >
                            {isAddingALWAPLong ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaPlus className="mr-1" />
                            )}
                            Add ALVWAP Long
                          </Button>
                        </MenubarItem>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-500 text-white w-full justify-start"
                            onClick={handleAddTop5ALWAPLongs}
                          >
                            Top 5 ALVWAP Longs
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                      <MenubarSubTrigger>ALWAP Short</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isAddingALWAPShort ? "bg-green-500" : "bg-red-500"
                            } text-white w-full justify-start`}
                            onClick={handleAddALWAPShort}
                          >
                            {isAddingALWAPShort ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaPlus className="mr-1" />
                            )}
                            Add ALWAP Short
                          </Button>
                        </MenubarItem>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 text-white w-full justify-start"
                            onClick={handleAddTop5ALWAPShorts}
                          >
                            Top 5 ALWAP Shorts
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                      <MenubarSubTrigger onPointerDown={preventClose}>
                        Pivot VWAPs
                      </MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Pivot High Left</span>
                            <Input
                              type="number"
                              min={1}
                              value={pivotHighLeftLen}
                              onChange={(e) =>
                                setPivotHighLeftLen(Number(e.target.value))
                              }
                              className="w-16 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Pivot High Right</span>
                            <Input
                              type="number"
                              min={1}
                              value={pivotHighRightLen}
                              onChange={(e) =>
                                setPivotHighRightLen(Number(e.target.value))
                              }
                              className="w-16 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Pivot Low Left</span>
                            <Input
                              type="number"
                              min={1}
                              value={pivotLowLeftLen}
                              onChange={(e) =>
                                setPivotLowLeftLen(Number(e.target.value))
                              }
                              className="w-16 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Pivot Low Right</span>
                            <Input
                              type="number"
                              min={1}
                              value={pivotLowRightLen}
                              onChange={(e) =>
                                setPivotLowRightLen(Number(e.target.value))
                              }
                              className="w-16 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-yellow-500 text-white w-full justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddPivotHighVWAPs();
                            }}
                          >
                            Add Pivot High VWAPs
                          </Button>
                        </MenubarItem>
                        <MenubarItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-cyan-500 text-white w-full justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddPivotLowVWAPs();
                            }}
                          >
                            Add Pivot Low VWAPs
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub>
                    {/* <MenubarSub>
                      <MenubarSubTrigger>Midas</MenubarSubTrigger>
                      <MenubarSubContent>
                        <MenubarItem>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-purple-500 text-white w-full justify-start"
                            onClick={handleAddMidas}
                          >
                            Add Midas
                          </Button>
                        </MenubarItem>
                      </MenubarSubContent>
                    </MenubarSub> */}
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem
                  onSelect={(event: Event) =>
                    preventClose(event as unknown as React.MouseEvent)
                  }
                >
                  <div
                    className="flex items-center justify-between w-full"
                    onPointerDown={(event: React.PointerEvent) =>
                      preventClose(event)
                    }
                  >
                    <span>Alert Toasts</span>
                    <div className="flex items-center">
                      <Switch
                        id="alert-toasts"
                        checked={state.allowAlertToasts}
                        onCheckedChange={(checked) => {
                          handleAlertToggle(checked);
                        }}
                      />
                    </div>
                  </div>
                </MenubarItem>
              </MenubarContent>
            )}
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
}
