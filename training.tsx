import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useHub } from "@/lib/store";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DataTableDisclosure } from "@/components/charts";
import { fmt0, fmt1, fmtDate, TODAY, workoutsThisWeek } from "@/lib/calc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const chartConfig = { weight: { label: "Gewicht (kg)", color: "var(--color-primary)" } } satisfies ChartConfig;

export function TrainingPage() {
  const plans = useHub((s) => s.plans);
  const logs = useHub((s) => s.workoutLogs);
  const targets = useHub((s) => s.targets);
  const updateExercise = useHub((s) => s.updateExercise);
  const addExercise = useHub((s) => s.addExercise);
  const removeExercise = useHub((s) => s.removeExercise);
  const logWorkout = useHub((s) => s.logWorkout);
  const removeWorkoutLog = useHub((s) => s.removeWorkoutLog);
  const confirm = useConfirm();

  const [active, setActive] = useState<"A" | "B">("A");
  const plan = plans.find((p) => p.id === active)!;
  const [date, setDate] = useState(TODAY);
  const [note, setNote] = useState("");

  const allExercises = Array.from(new Set(logs.flatMap((l) => l.entries.filter((e) => e.weight > 0).map((e) => e.name))));
  const [exName, setExName] = useState(allExercises[0] ?? "");
  const series = logs
    .map((l) => ({ date: fmtDate(l.date), weight: l.entries.find((e) => e.name === exName)?.weight }))
    .filter((d): d is { date: string; weight: number } => typeof d.weight === "number");

  const weekCount = workoutsThisWeek(logs).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Training</h1>
        <p className="text-sm">
          Diese Woche{" "}
          <span className="font-bold tabular-nums">
            {weekCount}/{targets.workoutsPerWeek}
          </span>{" "}
          Ganzkörpertrainings
        </p>
      </div>

      <div role="tablist" aria-label="Trainingsplan" className="inline-flex rounded-full bg-muted p-1">
        {plans.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            id={`tab-${p.id}`}
            aria-selected={active === p.id}
            aria-controls="plan-panel"
            onClick={() => setActive(p.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active === p.id ? "bg-blue-950 text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <Card id="plan-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">{plan.name}</h2>
          <p className="text-sm text-muted-foreground">{plan.focus}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="pb-2 font-semibold">Übung</th>
                <th scope="col" className="w-20 pb-2 font-semibold">Sätze</th>
                <th scope="col" className="w-28 pb-2 font-semibold">Wdh.</th>
                <th scope="col" className="w-28 pb-2 font-semibold">Gewicht (kg)</th>
                <th scope="col" className="w-10 pb-2"><span className="sr-only">Aktionen</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plan.exercises.map((e) => (
                <tr key={e.id}>
                  <td className="py-2 pr-2">
                    <Input aria-label="Übung" value={e.name} onChange={(ev) => updateExercise(plan.id, e.id, { name: ev.target.value })} className="h-9" />
                  </td>
                  <td className="py-2 pr-2">
                    <Input aria-label={`Sätze ${e.name}`} type="number" min={1} value={e.sets} onChange={(ev) => updateExercise(plan.id, e.id, { sets: Math.max(1, Number(ev.target.value)) })} className="h-9 tabular-nums" />
                  </td>
                  <td className="py-2 pr-2">
                    <Input aria-label={`Wiederholungen ${e.name}`} value={e.reps} onChange={(ev) => updateExercise(plan.id, e.id, { reps: ev.target.value })} className="h-9" />
                  </td>
                  <td className="py-2 pr-2">
                    <Input aria-label={`Gewicht ${e.name}`} type="number" min={0} step={0.5} value={e.weight} onChange={(ev) => updateExercise(plan.id, e.id, { weight: Math.max(0, Number(ev.target.value)) })} className="h-9 tabular-nums" />
                  </td>
                  <td className="py-2">
                    <Button type="button" variant="ghost" size="icon" aria-label={`${e.name} entfernen`} onClick={() => removeExercise(plan.id, e.id)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="outline" size="sm" className="self-start rounded-full" onClick={() => addExercise(plan.id)}>
          <Plus className="size-4" aria-hidden="true" /> Übung hinzufügen
        </Button>

        <form
          className="grid gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-950 sm:grid-cols-[10rem_1fr_auto] sm:items-end dark:bg-emerald-950 dark:text-emerald-50"
          onSubmit={(ev) => {
            ev.preventDefault();
            logWorkout({
              date,
              planId: plan.id,
              note: note.trim(),
              entries: plan.exercises.map((e) => ({ exerciseId: e.id, name: e.name, sets: e.sets, reps: e.reps, weight: e.weight })),
            });
            setNote("");
            toast.success(`${plan.name} eingetragen`);
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="wdate">Datum</Label>
            <Input id="wdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-card text-foreground" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wnote">Notiz (optional)</Label>
            <Textarea id="wnote" rows={1} value={note} onChange={(e) => setNote(e.target.value)} className="min-h-9 bg-card text-foreground" />
          </div>
          <Button type="submit" className="rounded-full">
            <CheckCircle2 className="size-4" aria-hidden="true" /> Training abschließen
          </Button>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="gap-2 p-5">
          <h2 className="text-lg font-bold">Kraftentwicklung</h2>
          <div className="space-y-1">
            <Label htmlFor="exsel" className="text-xs text-muted-foreground">Übung</Label>
            <NativeSelect id="exsel" size="sm" value={exName} onChange={(e) => setExName(e.target.value)}>
              {allExercises.map((n) => (
                <NativeSelectOption key={n} value={n}>{n}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {series.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {fmt1(series[0].weight)} → {fmt1(series[series.length - 1].weight)} kg in {series.length} Einheiten
              </p>
              <ChartContainer config={chartConfig} className="h-52 w-full">
                <LineChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis tickLine={false} axisLine={false} width={32} domain={["dataMin - 5", "dataMax + 5"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="weight" type="stepAfter" stroke="var(--color-weight)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ChartContainer>
              <DataTableDisclosure summary="Werte als Tabelle" head={["Datum", "kg"]} rows={series.map((s) => [s.date, fmt1(s.weight)])} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Einträge für diese Übung.</p>
          )}
        </Card>

        <section className="space-y-3" aria-labelledby="th-h">
          <h2 id="th-h" className="text-lg font-bold">Trainingshistorie</h2>
          <ol className="space-y-2">
            {[...logs].reverse().map((l) => {
              const volume = l.entries.reduce((a, e) => a + e.sets * (parseInt(e.reps, 10) || 0) * e.weight, 0);
              return (
                <li key={l.id}>
                  <details className="group rounded-2xl border border-border bg-card">
                    <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-2xl p-3 focus-visible:outline-2 focus-visible:outline-ring">
                      <span>
                        <span className="font-semibold">{l.planId === "A" ? "Ganzkörper A" : "Ganzkörper B"}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {fmtDate(l.date, { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}
                        </span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">Volumen ca. {fmt0(volume)} kg</span>
                    </summary>
                    <div className="space-y-2 px-3 pb-3">
                      <ul className="text-sm">
                        {l.entries.map((e) => (
                          <li key={e.exerciseId} className="flex justify-between border-t border-border py-1.5">
                            <span>{e.name}</span>
                            <span className="tabular-nums text-muted-foreground">
                              {e.sets} × {e.reps}
                              {e.weight > 0 ? ` · ${fmt1(e.weight)} kg` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {l.note && <p className="text-sm italic">{l.note}</p>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (await confirm({ title: "Eintrag löschen?", confirmLabel: "Löschen", destructive: true })) removeWorkoutLog(l.id);
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" /> Eintrag löschen
                      </Button>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
