import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useHub } from "@/lib/store";
import { useConfirm } from "@/hooks/use-confirm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fmt1, fmtDate, signed1, sortedCheckIns, TODAY } from "@/lib/calc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function Scale({
  name,
  label,
  low,
  high,
  value,
  onChange,
}: {
  name: string;
  label: string;
  low: string;
  high: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="flex w-full items-baseline justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="tabular-nums text-primary">{value}/10</span>
      </legend>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <label key={n} className="relative">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "grid h-9 cursor-pointer place-items-center rounded-xl border text-sm font-semibold tabular-nums transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                value === n
                  ? "border-blue-950 bg-blue-950 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-blue-950"
                  : n <= value
                    ? "border-emerald-300 bg-emerald-100 text-emerald-950"
                    : "border-border bg-card hover:bg-muted",
              )}
            >
              {n}
            </span>
          </label>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </fieldset>
  );
}

export function CheckInPage() {
  const role = useHub((s) => s.role);
  const raw = useHub((s) => s.checkIns);
  const addCheckIn = useHub((s) => s.addCheckIn);
  const removeCheckIn = useHub((s) => s.removeCheckIn);
  const confirm = useConfirm();
  const checkIns = sortedCheckIns(raw);
  const last = checkIns[checkIns.length - 1];

  const [energy, setEnergy] = useState(7);
  const [hunger, setHunger] = useState(5);
  const [sleep, setSleep] = useState(7);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Wöchentlicher Check-in</h1>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const weight = Number(fd.get("weight"));
              const hip = Number(fd.get("hip"));
              const waist = Number(fd.get("waist"));
              const date = String(fd.get("date") || TODAY);
              if (!(weight > 0 && hip > 0 && waist > 0)) {
                toast.error("Bitte Gewicht, Hüft- und Bauchumfang eintragen.");
                return;
              }
              addCheckIn({
                date,
                weight,
                hip,
                waist,
                energy,
                hunger,
                sleep,
                feedback: String(fd.get("feedback") ?? "").trim(),
                author: role,
              });
              toast.success("Check-in gespeichert");
              e.currentTarget.reset();
            }}
          >
            <h2 className="text-lg font-bold">Neuer Check-in</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 space-y-1 sm:col-span-1">
                <Label htmlFor="date">Datum</Label>
                <Input id="date" name="date" type="date" defaultValue={TODAY} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight">Gewicht (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" min="30" placeholder={last ? fmt1(last.weight).replace(",", ".") : ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="hip">Hüfte (cm)</Label>
                <Input id="hip" name="hip" type="number" step="0.1" min="40" placeholder={last ? String(last.hip) : ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="waist">Bauch (cm)</Label>
                <Input id="waist" name="waist" type="number" step="0.1" min="40" placeholder={last ? String(last.waist) : ""} />
              </div>
            </div>
            <Scale name="energy" label="Energielevel" low="sehr niedrig" high="sehr hoch" value={energy} onChange={setEnergy} />
            <Scale name="hunger" label="Hungergefühl" low="kaum Hunger" high="ständig hungrig" value={hunger} onChange={setHunger} />
            <Scale name="sleep" label="Schlafqualität" low="sehr schlecht" high="sehr gut" value={sleep} onChange={setSleep} />
            <div className="space-y-1">
              <Label htmlFor="feedback">Feedback an {role === "coach" ? "Elena" : "den Coach"}</Label>
              <Textarea id="feedback" name="feedback" rows={4} placeholder="Wie lief die Woche? Was war leicht, was schwer?" />
            </div>
            <Button type="submit" className="w-full rounded-full sm:w-auto">
              Check-in speichern
            </Button>
          </form>
        </Card>

        <section className="space-y-3" aria-labelledby="hist-h">
          <h2 id="hist-h" className="text-lg font-bold">
            Verlauf
          </h2>
          <ol className="space-y-3">
            {[...checkIns].reverse().map((c) => {
              const idx = checkIns.findIndex((x) => x.id === c.id);
              const prev = checkIns[idx - 1];
              const d = prev ? c.weight - prev.weight : 0;
              return (
                <li key={c.id}>
                  <Card className="gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{fmtDate(c.date, { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}</p>
                        <p className="text-sm tabular-nums">
                          <span className="font-bold">{fmt1(c.weight)} kg</span>
                          {prev && (
                            <span className={d <= 0 ? "ml-2 text-emerald-800 dark:text-emerald-300" : "ml-2 text-amber-800 dark:text-amber-300"}>
                              {signed1(d)} kg
                            </span>
                          )}
                          <span className="ml-3 text-muted-foreground">
                            Hüfte {fmt1(c.hip)} · Bauch {fmt1(c.waist)} cm
                          </span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Check-in vom ${fmtDate(c.date)} löschen`}
                        onClick={async () => {
                          if (await confirm({ title: "Check-in löschen?", description: "Dieser Eintrag wird für Coach und Klientin entfernt.", confirmLabel: "Löschen", destructive: true })) {
                            removeCheckIn(c.id);
                          }
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">Energie {c.energy}</Badge>
                      <Badge variant="secondary">Hunger {c.hunger}</Badge>
                      <Badge variant="secondary">Schlaf {c.sleep}</Badge>
                      <Badge variant="outline">{c.author === "coach" ? "vom Coach" : "von Elena"}</Badge>
                    </div>
                    {c.feedback && <p className="text-sm">{c.feedback}</p>}
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
