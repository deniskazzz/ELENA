import { useState } from "react";
import { Lock, Trash2 } from "lucide-react";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/states";
import { fmtDate, TODAY } from "@/lib/calc";
import type { CoachNoteType } from "@/lib/types";
import { cn } from "@/lib/utils";

const types: { id: CoachNoteType; label: string; tone: string }[] = [
  { id: "anpassung", label: "Anpassungen", tone: "bg-blue-950 text-white" },
  { id: "empfehlung", label: "Empfehlungen", tone: "bg-emerald-200 text-emerald-950" },
  { id: "naechster-schritt", label: "Nächste Schritte", tone: "bg-sky-100 text-sky-950" },
];

export function CoachNotesPage() {
  const role = useHub((s) => s.role);
  const notes = useHub((s) => s.coachNotes);
  const add = useHub((s) => s.addCoachNote);
  const toggle = useHub((s) => s.toggleCoachNote);
  const remove = useHub((s) => s.removeCoachNote);
  const setRole = useHub((s) => s.setRole);
  const [type, setType] = useState<CoachNoteType>("anpassung");
  const [text, setText] = useState("");

  if (role !== "coach") {
    return (
      <EmptyState
        icon={Lock}
        title="Nur für den Coach sichtbar"
        action={
          <Button variant="outline" className="rounded-full" onClick={() => setRole("coach")}>
            Als Coach ansehen
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Coach-Notizen</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
          <Lock className="size-3.5" aria-hidden="true" /> nur Coach
        </span>
      </div>

      <Card className="p-5">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            add({ type, text: text.trim(), date: TODAY });
            setText("");
          }}
        >
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Art der Notiz</legend>
            <div className="flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={type === t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring",
                    type === t.id ? cn(t.tone, "border-transparent") : "border-border bg-card hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1">
            <Label htmlFor="note">Notiz</Label>
            <Textarea id="note" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <Button type="submit" className="rounded-full">Notiz speichern</Button>
        </form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {types.map((t) => {
          const list = notes.filter((n) => n.type === t.id).sort((a, b) => Number(a.done) - Number(b.done) || b.date.localeCompare(a.date));
          return (
            <section key={t.id} aria-labelledby={`h-${t.id}`} className="space-y-3">
              <h2 id={`h-${t.id}`} className="flex items-center justify-between">
                <span className={cn("rounded-full px-3 py-1 text-sm font-bold", t.tone)}>{t.label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{list.filter((n) => !n.done).length} offen</span>
              </h2>
              <ul className="space-y-2">
                {list.map((n) => (
                  <li key={n.id}>
                    <Card className={cn("gap-2 p-4", n.done && "opacity-75")}>
                      <div className="flex items-start gap-3">
                        <Checkbox id={`n-${n.id}`} checked={n.done} onCheckedChange={() => toggle(n.id)} className="mt-0.5" />
                        <label htmlFor={`n-${n.id}`} className={cn("flex-1 text-sm leading-relaxed", n.done && "line-through")}>
                          {n.text}
                        </label>
                        <Button type="button" variant="ghost" size="icon" aria-label="Notiz löschen" onClick={() => remove(n.id)}>
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <p className="pl-7 text-xs text-muted-foreground">{fmtDate(n.date, { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                    </Card>
                  </li>
                ))}
                {list.length === 0 && <li className="text-sm text-muted-foreground">Keine Einträge.</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
