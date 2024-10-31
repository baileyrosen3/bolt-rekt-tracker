"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { BarChart, RefreshCcw, Settings } from "lucide-react";

export default function Header() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulating data refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <header className="p-6 bg-gray-800 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <BarChart className="mr-2" />
          Rekt Tracker
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
