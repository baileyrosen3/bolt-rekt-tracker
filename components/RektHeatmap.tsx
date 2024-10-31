import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Component() {
  const [timeSinceLastClick, setTimeSinceLastClick] = useState<string>("Never");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [counter, setCounter] = useState<number>(0);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prevCounter) => {
        if (!isOverlayVisible) {
          if (prevCounter >= 60) {
            // After 60 seconds, show the overlay again
            setIsOverlayVisible(true);
            return 0;
          } else {
            return prevCounter + 1;
          }
        } else {
          // If overlay is visible, reset counter
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOverlayVisible]);

  const handleClick = () => {
    const now = new Date();
    setTimeSinceLastClick(now.toLocaleTimeString());
    setCounter(0);
  };

  const handleOverlayClick = () => {
    handleClick();
    setIsOverlayVisible(false);
  };

  return (
    <Card
      className="bg-gray-800 border-gray-800 w-full h-auto flex flex-col"
      style={{ height: "612px" }}
    >
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-gray-300">Rekt Zones</CardTitle>
        <CardDescription className="text-gray-300">
          Visualize rekt events on a heatmap
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden rounded-lg">
        <div className="w-full h-full bg-gray-800 flex justify-center items-center rounded-t-lg relative">
          <iframe
            id="rekt-heatmap-iframe"
            src="https://www.coinglass.com/pro/futures/LiquidationHeatMap"
            className="w-full h-full border-none transform scale-130 rounded-t-lg"
            title="Rekt Heatmap"
            style={{
              height: "414px",
              transformOrigin: "0 0",
              marginLeft: "0px",
              marginTop: "0px",
            }}
          />
          {isOverlayVisible && (
            <div
              onClick={handleOverlayClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleOverlayClick();
                }
              }}
              className="absolute top-0 left-0 w-full h-full cursor-pointer"
              style={{ backgroundColor: "transparent" }}
            >
              <div className="bg-orange-700 bg-opacity-80 p-2 rounded flex justify-start items-end p-2 h-auto w-auto absolute bottom-0 left-0">
                <p className="text-gray-100 text-xs">
                  Click to interact with the heatmap
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row w-full bg-gray-800 p-4 space-x-4 rounded-b-lg">
          <p className="text-sm text-gray-300">
            Last clicked:{" "}
            <span className="font-medium text-gray-100">
              {timeSinceLastClick}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
