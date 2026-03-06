import { getHistoryStats } from '@/actions/history.actions';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Dumbbell, HeartPlus, Calendar1 } from "lucide-react";

const HistoryStatsCard = async () => {
    const stats = await getHistoryStats();

    const isPositive = stats.percentChangeFromLastMonth > 0;
    const isNeutral = stats.percentChangeFromLastMonth === 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            {/* Card 1: Total Workouts */}
            <Card className="bg-card border-border relative overflow-hidden">
                <CardContent className="p-5">
                    {/* Background icon */}
                    <span className="absolute -right-4 -bottom-8 opacity-10 select-none">
                        <Dumbbell className="text-muted-foreground size-35 rotate-75" />
                    </span>

                    <p className="text-sm text-muted-foreground mb-1">Total Workouts</p>
                    <p className="text-4xl font-bold text-foreground mb-2">
                        {stats.totalWorkouts}
                    </p>

                    {/* % change badge */}
                    <div className="flex items-center gap-1.5 text-sm">
                        {isNeutral ? (
                            <>
                                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">No change from last month</span>
                            </>
                        ) : isPositive ? (
                            <>
                                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                <span className="text-green-500 font-medium">
                                    +{stats.percentChangeFromLastMonth}% from last month
                                </span>
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                                <span className="text-destructive font-medium">
                                    {stats.percentChangeFromLastMonth}% from last month
                                </span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Card 2: Favorite Muscle Group */}
            <Card className="bg-card border-border relative overflow-hidden">
                <CardContent className="p-5">
                    {/* Background icon */}
                    <span className="absolute -right-4 -bottom-8 text-6xl opacity-10 select-none">
                        <HeartPlus className="text-muted-foreground size-35 -rotate-45" />
                    </span>

                    <p className="text-sm text-muted-foreground mb-1">Favorite Muscle Group</p>
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-4xl font-bold text-foreground">
                            {stats.favoriteMuscleGroup}
                        </p>
                        <Badge className="bg-primary/20 text-primary border-primary/30 border text-[10px] uppercase tracking-wide">
                            Dominant
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {stats.favoritePercentage}% of total volume
                    </p>
                </CardContent>
            </Card>

            {/* Card 3: Most Active Day */}
            <Card className="bg-card border-border relative overflow-hidden">
                <CardContent className="p-5">
                    {/* Background icon */}
                    <span className="absolute -right-4 -bottom-8 text-6xl opacity-10 select-none">
                        <Calendar1 className="text-muted-foreground size-35 -rotate-45" />
                    </span>
                    <p className="text-sm text-muted-foreground mb-1">Most Active Day</p>
                    <p className="text-4xl font-bold text-foreground mb-2">
                        {stats.mostActiveDay}
                    </p>

                    {/* Peak hour bar visual */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-end gap-0.5 h-5">
                            {[0.4, 0.7, 1, 0.8, 0.5].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1.5 rounded-sm bg-primary"
                                    style={{ height: `${h * 100}%` }}
                                />
                            ))}
                        </div>
                        <span>Peak: {stats.peakHourRange}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default HistoryStatsCard