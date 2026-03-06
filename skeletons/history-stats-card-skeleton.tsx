import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryStatsCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border">
                    <CardContent className="space-y-1.5">
                        <Skeleton className="h-6 w-40 rounded animate-pulse" />
                        <Skeleton className="h-10 w-50 rounded animate-pulse" />
                        <Skeleton className="h-5 w-60 rounded animate-pulse" />
                    </CardContent>
                </Card>
            ))
            }
        </div >
    );
}