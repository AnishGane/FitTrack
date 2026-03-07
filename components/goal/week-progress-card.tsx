// components/goals/WeekProgress.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStreakData, getWeekProgress } from "@/actions/goal.action";

//  Circular progress ring
function CircularProgress({ done, total }: { done: number; total: number }) {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(done / total, 1);
    const offset = circumference - progress * circumference;

    return (
        <div className="relative flex items-center justify-center w-44 h-44 shrink-0">
            <svg className="w-44 h-44 -rotate-90" viewBox="0 0 120 120">
                {/* Define the glow filter */}
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track */}
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="#6A706260"
                    strokeWidth="10"
                />
                {/* Progress */}
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="green"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    // filter="url(#glow)"
                    className="transition-all duration-700 ease-out"
                />
            </svg>
            {/* Center text */}
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground font-mono">
                    {done}/{total}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Days Done
                </span>
            </div>
        </div>
    );
}

// Day bubble
function DayBubble({
    label,
    isToday,
    hasWorkout,
    isFuture,
}: {
    label: string;
    isToday: boolean;
    hasWorkout: boolean;
    isFuture: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            {/* Circle */}
            <div
                className={cn(
                    "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                    hasWorkout
                        ? "border-primary bg-primary/20"          // worked out
                        : isToday
                            ? "border-primary bg-transparent"          // today, no workout yet
                            : isFuture
                                ? "border-border bg-transparent opacity-40" // future
                                : "border-border bg-muted/30"               // past, missed
                )}
            >
                {hasWorkout ? (
                    <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : isToday ? (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                ) : null}
            </div>

            {/* Label */}
            <span className={cn(
                "text-[10px] font-semibold uppercase tracking-wide",
                isToday ? "text-primary" : "text-muted-foreground"
            )}>
                {isToday ? (
                    <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px]">
                        TODAY
                    </span>
                ) : label}
            </span>
        </div>
    );
}

// ── Week Progress Card ────────────────────────────────────────────
async function WeekProgressCard() {
    const data = await getWeekProgress();

    return (
        <Card className="bg-card border-border">
            <CardContent className="p-6 flex flex-col gap-5">
                <h2 className="text-base font-semibold text-foreground">
                    This Week&apos;s Progress
                </h2>

                {/* Ring + Days grid */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <CircularProgress done={data.doneDays} total={data.targetDays} />

                    {/* Days of week */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
                        {data.weekDays.map((day) => (
                            <DayBubble
                                key={day.label}
                                label={day.label}
                                isToday={day.isToday}
                                hasWorkout={day.hasWorkout}
                                isFuture={day.isFuture}
                            />
                        ))}
                    </div>
                </div>

                {/* Info message */}
                {data.sessionsNeeded > 0 ? (
                    <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm">
                        <Info className="size-4 text-muted-foreground shrink-0" />
                        <p className="text-muted-foreground">
                            You need{" "}
                            <span className="font-bold text-foreground">
                                {data.sessionsNeeded} more session{data.sessionsNeeded > 1 ? "s" : ""}
                            </span>{" "}
                            to hit your weekly goal of {data.targetDays} days.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 text-sm">
                        <span className="text-lg">🎉</span>
                        <p className="text-primary font-medium">
                            Weekly goal achieved! Amazing work this week.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Streak Banner 
async function StreakBanner() {
    const { streak } = await getStreakData();

    return (
        <Card className="bg-card border-border">
            <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center">
                        <Flame className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">
                            You&apos;re on a {streak}-day streak!
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Keep it up, you&apos;re building a great habit.
                        </p>
                    </div>
                </div>

                <Link
                    href="/workout"
                    className="flex items-center gap-1.5 text-primary font-semibold text-sm hover:opacity-80 transition-opacity shrink-0"
                >
                    Log Workout
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            </CardContent>
        </Card>
    );
}

// ── Export both ───────────────────────────────────────────────────
export { WeekProgressCard, StreakBanner };