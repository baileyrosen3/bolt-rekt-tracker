import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { RektChart } from "@/components/dashboard/rekt-chart";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { MarketHeatmap } from "@/components/dashboard/market-heatmap";

export default function Home() {
  return (
    <DashboardShell>
      <DashboardHeader />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="grid gap-4">
            <RektChart />
            <MarketHeatmap />
          </div>
        </div>
        <div className="col-span-3">
          <QuickStats />
        </div>
      </div>
    </DashboardShell>
  );
}