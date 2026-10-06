import { useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { catLabel, fmt0, fmt1 } from "@/lib/calc";
import type { Food, FoodCategory } from "@/lib/types";
import { toast } from "sonner";


type Draft = { name: string; category: FoodCategory; kcal: string; protein: string; carbs: string; fat: string };
const empty: Draft = { name: "", category: "protein", kcal: "", protein: "", carbs: "", fat: "" };
const num = (v: string) => Number(v.replace(",", "."));

export function FoodManager() {
  const foods = useHub((s) => s.foods);
  const addFood = useHub((s) => s.addFood);
  const updateFood = useHub((s) => s.updateFood);
  const removeFood = useHub((s) => s.removeFood);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const p = num(draft.protein) || 0;
  const c = num(draft.carbs) || 0;
  const f = num(draft.fat) || 0;
  const macroKcal = p * 4 + c * 4 + f * 9;

  const startEdit = (food: Food) => {
    setEditId(food.id);
    setDraft({
      name: food.name,
      category: food.category,
      kcal: String(food.kcal),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
  };
  const reset = () => {
    setEditId(null);
    setDraft(empty);
  };

  const shown = foods
    .filter((x) => x.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => Number(!!b.custom) - Number(!!a.custom) || a.name.localeCompare(b.name, "de"));

  return (
    <section aria-labelledby="foods-h" className="space-y-4">
      <h2 id="foods-h" className="text-xl font-bold">
        Lebensmittel & Nährwerte
      </h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card className="gap-4 p-5">
          <h3 className="font-bold">{editId ? "Lebensmittel bearbeiten" : "Eigenes Lebensmittel anlegen"}</h3>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const name = draft.name.trim();
              const values = { kcal: num(draft.kcal || String(Math.round(macroKcal))), protein: p, carbs: c, fat: f };
              if (!name) return toast.error("Bitte einen Namen eingeben.");
              if (Object.values(values).some((v) => !Number.isFinite(v) || v < 0)) return toast.error("Bitte gültige Nährwerte eingeben.");
              if (editId) {
                updateFood(editId, { name, category: draft.category, ...values });
                toast.success(`${name} aktualisiert`);
              } else {
                addFood({ name, category: draft.category, ...values });
                toast.success(`${name} hinzugefügt – jetzt in allen Mahlzeiten wählbar`);
              }
              reset();
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1 sm:col-span-1">
                <Label htmlFor="fname">Name</Label>
                <Input id="fname" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="z. B. Proteinbrot" />
              </div>
              <div className="col-span-2 space-y-1 sm:col-span-1">
                <Label htmlFor="fcat">Kategorie</Label>
                <NativeSelect id="fcat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as FoodCategory })} className="w-full">
                  {Object.entries(catLabel).map(([k, l]) => (
                    <NativeSelectOption key={k} value={k}>{l}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Nährwerte je 100 g</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {([
                  ["protein", "Protein (g)"],
                  ["carbs", "Kohlenhydrate (g)"],
                  ["fat", "Fett (g)"],
                  ["kcal", "Kalorien (kcal)"],
                ] as const).map(([k, l]) => (
                  <div key={k} className="space-y-1">
                    <Label htmlFor={`f-${k}`} className="text-xs">{l}</Label>
                    <Input
                      id={`f-${k}`}
                      inputMode="decimal"
                      value={draft[k]}
                      placeholder={k === "kcal" && macroKcal > 0 ? String(Math.round(macroKcal)) : "0"}
                      onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                      className="tabular-nums"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Aus den Makros berechnet: {fmt0(macroKcal)} kcal. Bleibt das Kalorienfeld leer, wird dieser Wert übernommen.
              </p>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="rounded-full">
                <Plus className="size-4" aria-hidden="true" /> {editId ? "Änderungen speichern" : "Lebensmittel speichern"}
              </Button>
              {editId && (
                <Button type="button" variant="ghost" className="rounded-full" onClick={reset}>
                  <X className="size-4" aria-hidden="true" /> Abbrechen
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card className="gap-3 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="fsearch" className="sr-only">Lebensmittel suchen</label>
            <Input id="fsearch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lebensmittel suchen" className="rounded-full pl-9" />
          </div>
          <div className="max-h-[26rem] overflow-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted text-left text-xs">
                <tr>
                  <th scope="col" className="px-3 py-2">Lebensmittel</th>
                  <th scope="col" className="px-2 py-2 text-right">kcal</th>
                  <th scope="col" className="px-2 py-2 text-right">P</th>
                  <th scope="col" className="px-2 py-2 text-right">KH</th>
                  <th scope="col" className="px-2 py-2 text-right">F</th>
                  <th scope="col" className="w-20 px-2 py-2"><span className="sr-only">Aktionen</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr key={x.id} className="border-t border-border">
                    <td className="px-3 py-1.5">
                      <span className="font-medium">{x.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {catLabel[x.category]} {x.custom && <Badge variant="secondary" className="ml-1">eigenes</Badge>}
                      </span>
                    </td>
                    <td className="px-2 text-right tabular-nums">{fmt0(x.kcal)}</td>
                    <td className="px-2 text-right tabular-nums">{fmt1(x.protein)}</td>
                    <td className="px-2 text-right tabular-nums">{fmt1(x.carbs)}</td>
                    <td className="px-2 text-right tabular-nums">{fmt1(x.fat)}</td>
                    <td className="px-1 text-right">
                      <Button type="button" variant="ghost" size="icon" aria-label={`${x.name} bearbeiten`} onClick={() => startEdit(x)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      {x.custom && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`${x.name} löschen`}
                          onClick={() => {
                            if (removeFood(x.id)) toast.success(`${x.name} gelöscht`);
                            else toast.error(`${x.name} wird noch in einer Mahlzeit verwendet.`);
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Werte je 100 g · P = Protein, KH = Kohlenhydrate, F = Fett</p>
        </Card>
      </div>
    </section>
  );
}
