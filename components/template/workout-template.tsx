import { WorkoutTemplate } from '@/db/schema'
import WorkoutTemplateCard from './workout-template-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TABS } from '@/constants';
import { Badge } from '../ui/badge';

interface WorkoutTemplateListProps {
    template: WorkoutTemplate[];
    usageMap: Record<string, number>;
}

const WorkoutTemplateList = ({ template, usageMap }: WorkoutTemplateListProps) => {

    const grouped = template.reduce(
        (acc, t) => {
            const key = t.muscleGroup ?? "full_body";
            if (!acc[key]) acc[key] = [];
            acc[key].push(t);
            return acc;
        },
        {} as Record<string, WorkoutTemplate[]>
    );

    return (
        <>
            <div className="flex flex-col">
                <h1 className='text-lg font-medium'>Workout Templates</h1>
                <p className='text-xs md:text-sm text-muted-foreground'>Choose your desired workout from the list of templates.</p>
            </div>
            <Tabs defaultValue="chest" className="mt-8">
                <TabsList className="flex flex-wrap h-auto gap-1.5 bg-muted/40 rounded-xl w-full">
                    {TABS.map(({ value, label }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="gap-1.5 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer">
                            <span>{label}</span>
                            {grouped[value]?.length > 0 && (
                                <Badge className="text-[10px] bg-primary/80 py-2 px-1.5 rounded-full leading-none">
                                    {grouped[value].length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {TABS.map(({ value, label }) => (
                    <TabsContent key={value} value={value} className="mt-4 focus-visible:outline-none">
                        {!grouped[value]?.length ? (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <p className="text-3xl mb-2">🏋️</p>
                                <p className="font-medium text-foreground">No {label} templates yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {grouped[value].map((t) => (
                                    <WorkoutTemplateCard key={t.id} template={t} useCount={usageMap[t.id] ?? 0} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </>
    );
};

export default WorkoutTemplateList;
