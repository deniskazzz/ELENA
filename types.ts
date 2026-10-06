// Datenmodell des Nutrition Coaching Hubs.
// Alle Bereiche teilen sich EIN Datenobjekt (HubData), das Coach und Klientin
// gemeinsam sehen und bearbeiten. Nur `coachNotes` ist rollenbeschränkt.

export type Role = "coach" | "klientin";

export interface ClientProfile {
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  startWeight: number; // kg
  goalWeight: number; // kg
  heightCm: number;
  coachName: string;
}

export interface NutritionTargets {
  kcalMin: number;
  kcalMax: number;
  proteinMin: number; // g
  proteinMax: number; // g
  fatMin: number; // g
  fatMax: number; // g
  stepGoal: number; // Schritte / Tag
  workoutsPerWeek: number;
}

export type FoodCategory =
  | "protein"
  | "kohlenhydrate"
  | "fett"
  | "gemuese"
  | "obst"
  | "milchprodukt";

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  // Nährwerte je 100 g
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Selbst angelegtes Lebensmittel (bearbeit- und löschbar) */
  custom?: boolean;
}

export type MealSlot = "fruehstueck" | "mittagessen" | "snack" | "abendessen";

export interface MealItem {
  id: string;
  foodId: string;
  grams: number;
}

export interface Meal {
  slot: MealSlot;
  title: string;
  items: MealItem[];
}

export interface CheckIn {
  id: string;
  date: string;
  weight: number;
  hip: number; // cm
  waist: number; // cm
  energy: number; // 1–10
  hunger: number; // 1–10
  sleep: number; // 1–10
  feedback: string;
  author: Role;
}

export interface DailyLog {
  date: string;
  steps: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // z. B. "8–10"
  weight: number; // kg
}

export interface WorkoutPlan {
  id: "A" | "B";
  name: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutLogEntry {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  planId: "A" | "B";
  entries: WorkoutLogEntry[];
  note: string;
}

export type DocCategory =
  | "ernaehrungsplan"
  | "einkaufsliste"
  | "rezept"
  | "pdf"
  | "fortschrittsbericht";

export interface HubDocument {
  id: string;
  title: string;
  category: DocCategory;
  date: string;
  addedBy: Role;
  description: string;
  fileName?: string;
  sizeKb?: number;
  mimeType?: string;
  /** Schlüssel der im Browser gespeicherten Datei */
  fileId?: string;
}

export type CoachNoteType = "anpassung" | "empfehlung" | "naechster-schritt";

export interface CoachNote {
  id: string;
  date: string;
  type: CoachNoteType;
  text: string;
  done: boolean;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  label: "vorher" | "nachher";
  url: string; // blob:-URL, nur in der laufenden Sitzung
}

export interface HubData {
  profile: ClientProfile;
  targets: NutritionTargets;
  foods: Food[];
  meals: Meal[];
  checkIns: CheckIn[];
  dailyLogs: DailyLog[];
  plans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  documents: HubDocument[];
  coachNotes: CoachNote[];
}
