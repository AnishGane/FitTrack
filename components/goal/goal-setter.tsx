"use client"

import { upsertGoal } from '@/actions/goal.action';
import { useState, useTransition } from 'react'
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Target } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface GoalSetterProps {
    initialTarget: number;
    doneDays: number;
}

const GoalSetter = ({ initialTarget, doneDays }: GoalSetterProps) => {
    const minSelectable = Math.min(7, Math.max(1, doneDays));
    const [selected, setSelected] = useState(Math.max(initialTarget, minSelectable));
    const [isPending, startTransition] = useTransition();

    function handleUpdate() {
        startTransition(async () => {
            const result = await upsertGoal(selected);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    const isInvalid = selected < minSelectable;
    const hasChanged = selected !== initialTarget;

    return (
        <Card className="bg-card border-border sm:p-4 sm:py-5 sm:rounded-3xl">
            <CardContent className="flex flex-col gap-6">
                <div>
                    <span className='text-[10px] font-semibold uppercase tracking-widest text-muted-foreground'>Weekly Target</span>
                    <div className='flex items-center gap-2 mt-1 text-primary font-semibold'>
                        <Target className="size-4 text-primary" />
                        <span className=" text-xs  tracking-wide">
                            Active Goal
                        </span>
                    </div>
                </div>

                {/* Big number display */}
                <div className="flex items-baseline md:justify-center mb-2 gap-3">
                    <span className="text-8xl font-bold text-primary leading-none">
                        {selected}
                    </span>
                    <span className="text-2xl text-foreground font-medium">
                        days per week
                    </span>
                </div>

                {/* Day selector buttons */}
                <div className="flex items-center flex-wrap justify-center gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelected(day)}
                            disabled={day < minSelectable}
                            className={cn(
                                "size-11 rounded-full cursor-pointer text-lg font-semibold border-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40",
                                selected === day
                                    ? "bg-primary border-primary text-primary-foreground scale-110"
                                    : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                {/* Tip text */}
                <div className="flex items-center justify-center">
                    <p className="text-xs md:text-sm text-muted-foreground max-w-md text-center ">
                        {doneDays > 0 ? (
                            <>
                            </>
                        ) : null}{" "}
                        Setting a consistent goal is the first step to success. Most athletes
                        start with 3–4 days to build a lasting habit.
                    </p>
                </div>

                {/* Update button */}
                <Button
                    onClick={handleUpdate}
                    disabled={isPending || !hasChanged || isInvalid}
                    className="w-full py-6 text-base sm:rounded-2xl font-semibold cursor-pointer"
                    size="lg"
                >
                    {isPending
                        ? "Updating..."
                        : hasChanged
                            ? "Update Goal"
                            : (<span>
                                Goal Set
                            </span>
                            )}
                </Button>
            </CardContent>
        </Card>
    )
}

export default GoalSetter