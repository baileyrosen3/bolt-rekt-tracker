"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "00:00", value: 1000 },
  { time: "04:00", value: 1200 },
  { time: "08:00", value: 1100 },
  { time: "12:00", value: 1400 },
  { time: "16:00", value: 1300 },
  { time: "20:00", value: 1600 },
  { time: "24:00", value: 1500 },
];

const CustomXAxis = (props: any) => (
  <XAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
);

const CustomYAxis = (props: any) => (
  <YAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
    tickFormatter={(value) => `$${value}`}
  />
);

export function RektChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CustomXAxis dataKey="time" />
              <CustomYAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}