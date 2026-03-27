"use client"

import { format } from "date-fns";
import PageHeader from "../page-header";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-4">
      <PageHeader title="Dashboard" />
      <p className="mr-4 font-light">
        Happy {format(new Date(), "EEEE")}, Pal
      </p>
    </div>
  );
}