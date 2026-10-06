import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Check, Flame, Footprints, Beef, Dumbbell, Pencil, Scale } from "lucide-react";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProgressRing, WeightChart, DataTableDisclosure } from "@/components/charts";
import { addDays, carbTargets, fmt0, fmt1, fmtDate, signed1, sortedCheckIns, TODAY, weekStart, workoutsThisWeek } from "@/lib/calc";
import { toast } from "sonner";

export function HomePage() {
  const profile = useHub((s) => s.profile);
  const targets = useHub((s) => s.targets);
  const checkInsRaw = useHub((s) => s.checkIns);
  const dailyLogs = useHub((s) => s.dailyLogs);
  const workoutLogs = useHub((s) => s.workoutLogs);
  const plans = useHub((s) => s.plans);
  const setSteps = useHub((s) => s.setSteps);
  const setProfile = useHub((s) => s.setProfile);
  const setTargets = useHub((s) => s.setTargets);
  const addCheckIn = useHub((s) => s.addCheckIn);
  const removeCheckIn = useHub((s) => s.removeCheckIn);
  const logWorkout = useHub((s) => s.logWorkout);
  const removeWorkoutLog = useHub((s) => s.removeWorkoutLog);
  const role = useHub((s) => s.role);
  const [profileOpen, setProfileOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [editGoals, setEditGoals] = useState(false);

  const checkIns = sortedCheckIns(checkInsRaw);
  const latest = checkIns[checkIns.length - 1];
  const prev = checkIns[checkIns.length - 2];
  const current = latest?.weight ?? profile.startWeight;
  const lost = profile.startWeight - current;
  const toLose = profile.startWeight - profile.goalWeight;
  const progress = toLose > 0 ? lost / toLose : 0;
  const weeks = Math.max(1, Math.round((new Date(TODAY).getTime() - new Date(profile.startDate).getTime()) / (7 * 864e5)));
  const carbs = carbTargets(targets);

  const today = dailyLogs.find((d) => d.date === TODAY)?.steps ?? 0;
  const ws = weekStart(TODAY);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6)).map((d) => ({
    date: d,
    steps: dailyLogs.find((x) => x.date === d)?.steps ?? 0,
  }));
  const avg7 = last7.reduce((a, b) => a + b.steps, 0) / 7;
  const weekLogs = workoutsThisWeek(workoutLogs);
  const nextCheckIn = latest ? addDays(latest.date, 7) : TODAY;
  const checkInDue = nextCheckIn <= TODAY;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-emerald-300/20 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Hallo {profile.name}</h1>
            <p className="mt-1 text-blue-100">Woche {weeks} · seit {fmtDate(profile.startDate, { day: "2-digit", month: "long" })}</p>
            <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-blue-200">Aktuelles Gewicht</p>
                <p className="text-5xl font-bold tabular-nums">
                  {fmt1(current)}
                  <span className="ml-1 text-xl font-medium text-blue-200">kg</span>
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold text-emerald-300">{signed1(-lost)} kg</span> seit Start
                </p>
                {prev && (
                  <p>
                    <span className="font-semibold text-emerald-300">{signed1(current - prev.weight)} kg</span> zur Vorwoche
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" onClick={() => setWeightOpen(true)} className="rounded-full bg-emerald-300 text-blue-950 hover:bg-emerald-200">
                <Scale className="size-4" aria-hidden="true" /> Gewicht eintragen
              </Button>
              <Button type="button" variant="outline" onClick={() => setProfileOpen(true)} className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Pencil className="size-4" aria-hidden="true" /> Profil & Ziel bearbeiten
              </Button>
            </div>
          </div>
          <ProgressRing value={progress} label={`${Math.round(progress * 100)} Prozent des Zielgewichts erreicht`}>
            <div>
              <p className="text-3xl font-bold tabular-nums">{Math.round(Math.max(0, progress) * 100)}%</p>
              <p className="text-[11px] text-blue-100">zum Ziel {fmt1(profile.goalWeight)} kg</p>
            </div>
          </ProgressRing>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Weight chart */}
        <Card className="gap-0 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold">Gewichtsverlauf</h2>
            <Link to="/fortschritt" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Fortschritt <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            {checkIns.length} Check-ins · von {fmt1(checkIns[0]?.weight ?? 0)} auf {fmt1(current)} kg
          </p>
          <WeightChart checkIns={checkIns} goal={profile.goalWeight} className="h-64 w-full sm:h-72" />
          <DataTableDisclosure
            summary="Werte als Tabelle"
            head={["Datum", "Gewicht (kg)"]}
            rows={checkIns.map((c) => [fmtDate(c.date, { day: "2-digit", month: "2-digit", year: "numeric" }), fmt1(c.weight)])}
          />
        </Card>

        {/* Ziele */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Tagesziele</h2>
              <Button type="button" variant="ghost" size="sm" aria-expanded={editGoals} onClick={() => setEditGoals((v) => !v)}>
                <Pencil className="size-4" aria-hidden="true" /> {editGoals ? "Fertig" : "Anpassen"}
              </Button>
            </div>
            {editGoals ? (
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["kcalMin", "Kalorien min", 10],
                  ["kcalMax", "Kalorien max", 10],
                  ["proteinMin", "Protein min (g)", 1],
                  ["proteinMax", "Protein max (g)", 1],
                  ["fatMin", "Fett min (g)", 1],
                  ["fatMax", "Fett max (g)", 1],
                  ["stepGoal", "Schrittziel", 500],
                  ["workoutsPerWeek", "Trainings / Woche", 1],
                ] as const).map(([k, l, step]) => (
                  <div key={k} className="space-y-1">
                    <Label htmlFor={`g-${k}`} className="text-xs text-muted-foreground">{l}</Label>
                    <Input
                      id={`g-${k}`}
                      type="number"
                      min={0}
                      step={step}
                      value={targets[k]}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n) && n >= 0) setTargets({ [k]: n });
                      }}
                      className="h-9 tabular-nums"
                    />
                  </div>
                ))}
                <p className="col-span-2 text-xs text-muted-foreground">Änderungen werden sofort gespeichert. Kohlenhydrate: ca. {carbs.mid} g</p>
              </div>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-accent p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                      <Flame className="size-4" aria-hidden="true" /> Kalorien
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">
                      {fmt0(targets.kcalMin)}–{fmt0(targets.kcalMax)}
                      <span className="ml-1 text-xs font-medium text-muted-foreground">kcal</span>
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">
                    <dt className="flex items-center gap-1.5 text-xs font-medium">
                      <Beef className="size-4" aria-hidden="true" /> Protein
                    </dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">
                      {targets.proteinMin}–{targets.proteinMax}
                      <span className="ml-1 text-xs font-medium">g</span>
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground">
                  Fett {targets.fatMin}–{targets.fatMax} g · Kohlenhydrate ca. {carbs.mid} g ({carbs.min}–{carbs.max} g)
                </p>
              </>
            )}
          </Card>

          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Footprints className="size-5 text-primary" aria-hidden="true" /> Schritte
              </h2>
              <span className="text-sm text-muted-foreground">Ziel {fmt0(targets.stepGoal)}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {fmt0(today)} <span className="text-sm font-medium text-muted-foreground">heute</span>
            </p>
            <Progress value={Math.min(100, (today / targets.stepGoal) * 100)} aria-label="Schritte heute im Verhältnis zum Ziel" />
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const v = Number(new FormData(e.currentTarget).get("steps"));
                if (!Number.isFinite(v) || v < 0) return;
                setSteps({ date: TODAY, steps: Math.round(v) });
                toast.success("Schritte aktualisiert");
                e.currentTarget.reset();
              }}
            >
              <label htmlFor="steps" className="sr-only">Schritte heute eintragen</label>
              <Input id="steps" name="steps" type="number" min={0} inputMode="numeric" placeholder="Schritte eintragen" className="rounded-full" />
              <Button type="submit" className="rounded-full">Speichern</Button>
            </form>
            <div>
              <ul className="flex h-14 items-end gap-1.5" aria-label="Schritte der letzten 7 Tage">
                {last7.map((d) => {
                  const hit = d.steps >= targets.stepGoal;
                  return (
                    <li key={d.date} className="flex flex-1 flex-col items-center gap-1">
                      <span
                        className={hit ? "w-full rounded-md bg-emerald-400" : "w-full rounded-md bg-primary/30"}
                        style={{ height: `${Math.max(6, Math.min(100, (d.steps / (targets.stepGoal * 1.4)) * 100))}%` }}
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {fmtDate(d.date)}: {fmt0(d.steps)} Schritte{hit ? ", Ziel erreicht" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-xs text-muted-foreground">Ø 7 Tage: {fmt0(avg7)} Schritte</p>
            </div>
          </Card>

          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Dumbbell className="size-5 text-primary" aria-hidden="true" /> Training diese Woche
              </h2>
              <span className="text-sm font-semibold tabular-nums">
                {Math.min(weekLogs.length, targets.workoutsPerWeek)}/{targets.workoutsPerWeek}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {plans.map((p) => {
                const done = weekLogs.find((l) => l.planId === p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={!!done}
                      onClick={() => {
                        if (done) {
                          removeWorkoutLog(done.id);
                          toast(`${p.name} wieder auf offen gesetzt`);
                        } else {
                          logWorkout({
                            date: TODAY,
                            planId: p.id,
                            note: "",
                            entries: p.exercises.map((e) => ({ exerciseId: e.id, name: e.name, sets: e.sets, reps: e.reps, weight: e.weight })),
                          });
                          toast.success(`${p.name} als erledigt eingetragen`);
                        }
                      }}
                      className={
                        done
                          ? "w-full rounded-2xl bg-emerald-100 p-3 text-left text-emerald-950 focus-visible:outline-2 focus-visible:outline-ring"
                          : "w-full rounded-2xl border border-dashed border-border p-3 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                      }
                    >
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {done && <Check className="size-4" aria-hidden="true" />}
                      {p.name}
                    </p>
                    <p className={done ? "text-xs" : "text-xs text-muted-foreground"}>
                      {done ? `erledigt ${fmtDate(done.date, { weekday: "short", day: "2-digit", month: "2-digit" })}` : "offen – antippen zum Abhaken"}
                    </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">Woche ab {fmtDate(ws, { day: "2-digit", month: "long" })}</p>
          </Card>

          <Card className={checkInDue ? "gap-2 border-emerald-400 p-5" : "gap-2 p-5"}>
            <h2 className="text-lg font-bold">Nächster Check-in</h2>
            <p className="text-sm">
              {checkInDue ? "Heute fällig" : fmtDate(nextCheckIn, { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <Button asChild className="mt-1 self-start rounded-full">
              <Link to="/check-in">Check-in ausfüllen</Link>
            </Button>
          </Card>
        </div>
      </div>
      <Dialog open={weightOpen} onOpenChange={setWeightOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gewicht eintragen</DialogTitle>
            <DialogDescription>Umfänge und Skalen werden aus dem letzten Check-in übernommen. Am selben Tag wird der Eintrag ersetzt.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const w = Number(String(fd.get("w")).replace(",", "."));
              const date = String(fd.get("d") || TODAY);
              if (!(w > 30 && w < 250)) return toast.error("Bitte ein gültiges Gewicht eingeben.");
              const same = checkIns.find((c) => c.date === date);
              const base = same ?? latest;
              if (same) removeCheckIn(same.id);
              addCheckIn({
                date,
                weight: w,
                hip: base?.hip ?? 0,
                waist: base?.waist ?? 0,
                energy: base?.energy ?? 5,
                hunger: base?.hunger ?? 5,
                sleep: base?.sleep ?? 5,
                feedback: same?.feedback ?? "",
                author: role,
              });
              toast.success(`${fmt1(w)} kg gespeichert`);
              setWeightOpen(false);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="qw">Gewicht (kg)</Label>
                <Input id="qw" name="w" inputMode="decimal" autoFocus placeholder={fmt1(current)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qd">Datum</Label>
                <Input id="qd" name="d" type="date" defaultValue={TODAY} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-full">Speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil & Ziel bearbeiten</DialogTitle>
            <DialogDescription>Gilt für Dashboard, Fortschritt und Berichte.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const n = (k: string) => Number(String(fd.get(k)).replace(",", "."));
              const patch = {
                name: String(fd.get("name") ?? "").trim() || profile.name,
                startDate: String(fd.get("startDate") || profile.startDate),
                startWeight: n("startWeight"),
                goalWeight: n("goalWeight"),
                heightCm: n("heightCm"),
              };
              if (![patch.startWeight, patch.goalWeight, patch.heightCm].every((v) => v > 0)) return toast.error("Bitte gültige Werte eingeben.");
              setProfile(patch);
              toast.success("Profil gespeichert");
              setProfileOpen(false);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label htmlFor="pn">Name</Label>
                <Input id="pn" name="name" defaultValue={profile.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="psd">Startdatum</Label>
                <Input id="psd" name="startDate" type="date" defaultValue={profile.startDate} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ph">Größe (cm)</Label>
                <Input id="ph" name="heightCm" inputMode="decimal" defaultValue={profile.heightCm} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="psw">Startgewicht (kg)</Label>
                <Input id="psw" name="startWeight" inputMode="decimal" defaultValue={profile.startWeight} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pgw">Zielgewicht (kg)</Label>
                <Input id="pgw" name="goalWeight" inputMode="decimal" defaultValue={profile.goalWeight} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-full">Speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
