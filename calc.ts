import type { CheckIn, Food, FoodCategory, Meal, NutritionTargets, WorkoutLog } from "./types";

export const TODAY = "2026-10-06";

const de1 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const de0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
export const fmt1 = (n: number) => de1.format(n);
export const fmt0 = (n: number) => de0.format(n);
export const signed1 = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "±") + fmt1(Math.abs(n));

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit" }) {
  return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", opts);
}

/** Kohlenhydrate automatisch aus Kalorien, Protein und Fett (4/4/9 kcal pro g). */
export function carbTargets(t: NutritionTargets) {
  const kcalMid = (t.kcalMin + t.kcalMax) / 2;
  const pMid = (t.proteinMin + t.proteinMax) / 2;
  const fMid = (t.fatMin + t.fatMax) / 2;
  const mid = Math.max(0, (kcalMid - pMid * 4 - fMid * 9) / 4);
  const min = Math.max(0, (t.kcalMin - t.proteinMax * 4 - t.fatMax * 9) / 4);
  const max = Math.max(0, (t.kcalMax - t.proteinMin * 4 - t.fatMin * 9) / 4);
  return { min: Math.round(min), max: Math.round(max), mid: Math.round(mid), kcalMid, pMid, fMid };
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function itemMacros(food: Food | undefined, grams: number): Macros {
  if (!food) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  const f = grams / 100;
  return { kcal: food.kcal * f, protein: food.protein * f, carbs: food.carbs * f, fat: food.fat * f };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (a, b) => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function mealMacros(meal: Meal, foods: Food[]): Macros {
  return sumMacros(meal.items.map((i) => itemMacros(foods.find((f) => f.id === i.foodId), i.grams)));
}

/** Menge des Ersatzlebensmittels mit gleichen Kalorien, auf 5 g gerundet. */
export function equivalentGrams(from: Food, grams: number, to: Food) {
  const kcal = (from.kcal * grams) / 100;
  const g = to.kcal > 0 ? (kcal / to.kcal) * 100 : grams;
  return Math.max(5, Math.round(g / 5) * 5);
}

export function sortedCheckIns(c: CheckIn[]) {
  return [...c].sort((a, b) => a.date.localeCompare(b.date));
}

/** Montag der Woche (ISO) für ein Datum. */
export function weekStart(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function workoutsThisWeek(logs: WorkoutLog[], today = TODAY) {
  const ws = weekStart(today);
  const we = addDays(ws, 6);
  return logs.filter((l) => l.date >= ws && l.date <= we);
}

export const catLabel: Record<FoodCategory, string> = {
  protein: "Protein",
  kohlenhydrate: "Kohlenhydrate",
  fett: "Fett",
  gemuese: "Gemüse",
  obst: "Obst",
  milchprodukt: "Milchprodukt",
};

