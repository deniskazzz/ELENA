import { useState } from "react";
import { Plus, Repeat, Trash2 } from "lucide-react";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { catLabel, carbTargets, equivalentGrams, fmt0, itemMacros, mealMacros, sumMacros } from "@/lib/calc";
import type { Meal, NutritionTargets } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FoodManager } from "@/components/food-manager";
import { toast } from "sonner";


function NumField({
  id,
  label,
  value,
  onChange,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={0}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && n >= 0) onChange(n);
        }}
        className="tabular-nums"
      />
    </div>
  );
}

function MacroBar({
  label,
  value,
  min,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  color: string;
}) {
  const inRange = value >= min && value <= max;
  const scale = max * 1.25 || 1;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="tabular-nums">
          <span className="font-bold">{fmt0(value)}</span>
          <span className="text-muted-foreground">
            {" "}
            / {fmt0(min)}–{fmt0(max)} {unit}
          </span>
        </span>
      </div>
      <div className="relative mt-1.5 h-3 rounded-full bg-muted" aria-hidden="true">
        <div
          className="absolute inset-y-0 rounded-full bg-emerald-200/70 dark:bg-emerald-900"
          style={{ left: `${(min / scale) * 100}%`, width: `${((max - min) / scale) * 100}%` }}
        />
        <div className={cn("absolute inset-y-0 left-0 rounded-full", color)} style={{ width: `${Math.min(100, (value / scale) * 100)}%` }} />
      </div>
      <p className={cn("mt-1 text-xs", inRange ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300")}>
        {inRange ? "im Zielbereich" : value < min ? `${fmt0(min - value)} ${unit} unter Ziel` : `${fmt0(value - max)} ${unit} über Ziel`}
      </p>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const foods = useHub((s) => s.foods);
  const updateMealItem = useHub((s) => s.updateMealItem);
  const addMealItem = useHub((s) => s.addMealItem);
  const removeMealItem = useHub((s) => s.removeMealItem);
  const [newFood, setNewFood] = useState(foods[0]?.id ?? "");
  const [newGrams, setNewGrams] = useState(100);
  const m = mealMacros(meal, foods);

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{meal.title}</h3>
        <p className="text-sm tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{fmt0(m.kcal)} kcal</span> · P {fmt0(m.protein)} g · F {fmt0(m.fat)} g · KH {fmt0(m.carbs)} g
        </p>
      </div>
      <ul className="divide-y divide-border">
        {meal.items.map((item) => {
          const food = foods.find((f) => f.id === item.foodId);
          if (!food) return null;
          const im = itemMacros(food, item.grams);
          const alternatives = foods.filter((f) => f.category === food.category);
          return (
            <li key={item.id} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.4fr)_6rem_minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="truncate font-medium">{food.name}</p>
                <p className="text-xs text-muted-foreground">
                  {catLabel[food.category]} · {fmt0(im.kcal)} kcal · P {fmt0(im.protein)} g
                </p>
              </div>
              <div className="flex items-center gap-1 sm:order-none">
                <label htmlFor={`g-${item.id}`} className="sr-only">
                  Menge {food.name} in Gramm
                </label>
                <Input
                  id={`g-${item.id}`}
                  type="number"
                  min={0}
                  step={5}
                  value={item.grams}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n) && n >= 0) updateMealItem(meal.slot, item.id, { grams: n });
                  }}
                  className="h-8 w-20 tabular-nums"
                />
                <span className="text-xs text-muted-foreground">g</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
                <Repeat className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <label htmlFor={`swap-${item.id}`} className="sr-only">
                  {food.name} austauschen
                </label>
                <NativeSelect
                  id={`swap-${item.id}`}
                  size="sm"
                  value={food.id}
                  onChange={(e) => {
                    const to = foods.find((f) => f.id === e.target.value);
                    if (!to) return;
                    const g = equivalentGrams(food, item.grams, to);
                    updateMealItem(meal.slot, item.id, { foodId: to.id, grams: g });
                    toast.success(`${food.name} → ${to.name} (${g} g, gleiche Kalorien)`);
                  }}
                  className="w-full"
                >
                  {alternatives.map((a) => (
                    <NativeSelectOption key={a.id} value={a.id}>
                      {a.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`${food.name} entfernen`}
                onClick={() => removeMealItem(meal.slot, item.id)}
                className="row-start-1 col-start-2 justify-self-end sm:row-auto sm:col-auto"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          );
        })}
      </ul>
      <form
        className="flex flex-wrap items-end gap-2 rounded-2xl bg-muted/60 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newFood || newGrams <= 0) return;
          addMealItem(meal.slot, newFood, newGrams);
        }}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor={`add-${meal.slot}`} className="text-xs">
            Lebensmittel hinzufügen
          </Label>
          <NativeSelect id={`add-${meal.slot}`} size="sm" value={newFood} onChange={(e) => setNewFood(e.target.value)} className="w-full">
            {foods.map((f) => (
              <NativeSelectOption key={f.id} value={f.id}>
                {f.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`addg-${meal.slot}`} className="text-xs">
            Gramm
          </Label>
          <Input id={`addg-${meal.slot}`} type="number" min={5} step={5} value={newGrams} onChange={(e) => setNewGrams(Number(e.target.value))} className="h-8 w-20" />
        </div>
        <Button type="submit" size="sm" className="rounded-full">
          <Plus className="size-4" aria-hidden="true" /> Hinzufügen
        </Button>
      </form>
    </Card>
  );
}

export function NutritionPage() {
  const targets = useHub((s) => s.targets);
  const setTargets = useHub((s) => s.setTargets);
  const meals = useHub((s) => s.meals);
  const foods = useHub((s) => s.foods);
  const carbs = carbTargets(targets);
  const total = sumMacros(meals.map((m) => mealMacros(m, foods)));
  const set = (k: keyof NutritionTargets) => (n: number) => setTargets({ [k]: n });

  const kcalP = carbs.pMid * 4;
  const kcalF = carbs.fMid * 9;
  const kcalC = carbs.mid * 4;
  const kcalSum = kcalP + kcalF + kcalC || 1;
  const split = [
    { l: "Protein", v: kcalP, c: "bg-blue-900" },
    { l: "Fett", v: kcalF, c: "bg-emerald-400" },
    { l: "Kohlenhydrate", v: kcalC, c: "bg-sky-300" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ernährungsplan</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="gap-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Ziele anpassen</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumField id="kmin" label="Kalorien min (kcal)" value={targets.kcalMin} onChange={set("kcalMin")} step={10} />
            <NumField id="kmax" label="Kalorien max (kcal)" value={targets.kcalMax} onChange={set("kcalMax")} step={10} />
            <NumField id="pmin" label="Protein min (g)" value={targets.proteinMin} onChange={set("proteinMin")} />
            <NumField id="pmax" label="Protein max (g)" value={targets.proteinMax} onChange={set("proteinMax")} />
            <NumField id="fmin" label="Fett min (g)" value={targets.fatMin} onChange={set("fatMin")} />
            <NumField id="fmax" label="Fett max (g)" value={targets.fatMax} onChange={set("fatMax")} />
            <NumField id="steps" label="Schrittziel / Tag" value={targets.stepGoal} onChange={set("stepGoal")} step={500} />
            <NumField id="wpw" label="Trainings / Woche" value={targets.workoutsPerWeek} onChange={set("workoutsPerWeek")} />
          </div>
          <div className="rounded-2xl bg-accent p-4 text-accent-foreground">
            <p className="text-xs font-semibold uppercase tracking-wider">Kohlenhydrate (automatisch)</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {carbs.mid} g <span className="text-base font-medium">({carbs.min}–{carbs.max} g)</span>
            </p>
            <p className="mt-1 text-xs">(Kalorien − Protein × 4 − Fett × 9) ÷ 4</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Energieverteilung</p>
            <div className="flex h-4 overflow-hidden rounded-full" aria-hidden="true">
              {split.map((s) => (
                <div key={s.l} className={s.c} style={{ width: `${(s.v / kcalSum) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {split.map((s) => (
                <li key={s.l} className="flex items-center gap-1.5">
                  <span className={cn("size-2.5 rounded-full", s.c)} aria-hidden="true" />
                  {s.l} {Math.round((s.v / kcalSum) * 100)} %
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="gap-5 p-5 sm:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Tagesplan vs. Ziel</h2>
            <p className="text-2xl font-bold tabular-nums">
              {fmt0(total.kcal)} <span className="text-sm font-medium text-muted-foreground">kcal</span>
            </p>
          </div>
          <MacroBar label="Kalorien" value={total.kcal} min={targets.kcalMin} max={targets.kcalMax} unit="kcal" color="bg-blue-900" />
          <MacroBar label="Protein" value={total.protein} min={targets.proteinMin} max={targets.proteinMax} unit="g" color="bg-blue-700" />
          <MacroBar label="Fett" value={total.fat} min={targets.fatMin} max={targets.fatMax} unit="g" color="bg-emerald-500" />
          <MacroBar label="Kohlenhydrate" value={total.carbs} min={carbs.min} max={carbs.max} unit="g" color="bg-sky-400" />
        </Card>
      </div>

      <section className="space-y-4" aria-labelledby="meals-h">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="meals-h" className="text-xl font-bold">
            Mahlzeiten
          </h2>
          <p className="text-sm text-muted-foreground">Beim Austauschen wird die Menge auf gleiche Kalorien umgerechnet.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {meals.map((m) => (
            <MealCard key={m.slot} meal={m} />
          ))}
        </div>
      </section>

      <FoodManager />
    </div>
  );
}
