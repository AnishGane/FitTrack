export function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-sm">
            <p className="text-muted-foreground mb-1">{label}</p>
            <p className="font-semibold text-foreground">{payload[0].value} min</p>
        </div>
    );
}