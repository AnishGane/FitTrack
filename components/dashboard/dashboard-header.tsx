"use client"

import { format } from "date-fns";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-4">
      <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
      <p className="mr-4 font-light">
        Happy {format(new Date(), "EEEE")}, Pal
      </p>
    </div>
  );
}