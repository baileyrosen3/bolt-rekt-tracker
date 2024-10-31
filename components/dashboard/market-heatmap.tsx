"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MarketHeatmap() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Market Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-[2/1] w-full rounded-lg bg-gradient-to-br from-chart-1 via-chart-3 to-chart-5 opacity-25" />
      </CardContent>
    </Card>
  );
}