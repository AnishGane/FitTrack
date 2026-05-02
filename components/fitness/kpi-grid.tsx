"use client";

import { Card, CardContent } from "@/components/ui/card";
import { KPI_CONFIG } from "@/constants";
import { FitnessStats } from "@/types";

interface KpiGridProps {
    stats: FitnessStats;
}

export default function KpiGrid({ stats }: KpiGridProps) {
    const items = KPI_CONFIG(stats);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {items.map((item) => (
                <Card key={item.label} className="bg-card border-border rounded-2xl py-2 sm:py-4">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <div className={`size-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                            <item.icon className={`size-4.5 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 leading-tight">
                                {item.value}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}