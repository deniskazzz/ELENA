import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { fmt1, fmtDate } from "@/lib/calc";
import type { CheckIn } from "@/lib/types";

const weightConfig = {
  weight: { label: "Gewicht (kg)", color: "var(--color-primary)" },
} satisfies ChartConfig;

export function WeightChart({
  checkIns,
  goal,
  className = "h-64 w-full",
}: {
  checkIns: CheckIn[];
  goal?: number;
  className?: string;
}) {
  const data = checkIns.map((c) => ({ date: fmtDate(c.date), weight: c.weight }));
  const vals = checkIns.map((c) => c.weight);
  const min = Math.floor(Math.min(...vals, goal ?? Infinity) - 0.5);
  const max = Math.ceil(Math.max(...vals) + 0.5);
  return (
    <ChartContainer config={weightConfig} className={className}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-weight)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis domain={[min, max]} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => fmt1(v)} />
        {goal !== undefined && (
          <ReferenceLine y={goal} stroke="#059669" strokeDasharray="6 4" label={{ value: `Ziel ${fmt1(goal)} kg`, position: "insideBottomRight", fill: "#047857", fontSize: 11 }} />
        )}
        <ChartTooltip isAnimationActive={false} content={<ChartTooltipContent />} />
        <Area isAnimationActive={false} dataKey="weight" type="monotone" stroke="var(--color-weight)" strokeWidth={2.5} fill="url(#wfill)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ChartContainer>
  );
}

const circConfig = {
  hip: { label: "Hüfte (cm)", color: "var(--color-primary)" },
  waist: { label: "Bauch (cm)", color: "#059669" },
} satisfies ChartConfig;

export function CircumferenceChart({ checkIns, className = "h-64 w-full" }: { checkIns: CheckIn[]; className?: string }) {
  const data = checkIns.map((c) => ({ date: fmtDate(c.date), hip: c.hip, waist: c.waist }));
  return (
    <ChartContainer config={circConfig} className={className}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} width={36} />
        <ChartTooltip isAnimationActive={false} content={<ChartTooltipContent />} />
        <Line isAnimationActive={false} dataKey="hip" type="monotone" stroke="var(--color-hip)" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line isAnimationActive={false} dataKey="waist" type="monotone" stroke="var(--color-waist)" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  );
}

/** Kreisförmige Fortschrittsanzeige (0–1). */
export function ProgressRing({
  value,
  size = 140,
  stroke = 12,
  label,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#6ee7b7"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** Tabellarische Alternative für Diagramme (Barrierefreiheit). */
export function DataTableDisclosure({
  summary,
  head,
  rows,
}: {
  summary: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className="group mt-3 text-sm">
      <summary className="cursor-pointer rounded-lg py-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        {summary}
      </summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-muted">
            <tr>
              {head.map((h) => (
                <th key={h} scope="col" className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                {r.map((c, j) => (
                  <td key={j} className="px-3 py-1.5 tabular-nums">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
