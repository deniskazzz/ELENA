import type {
  CheckIn,
  DailyLog,
  Food,
  HubData,
  WorkoutLog,
  WorkoutPlan,
} from "./types";

export const foods: Food[] = [
  // Protein
  { id: "skyr", name: "Skyr natur", category: "milchprodukt", kcal: 63, protein: 11, carbs: 4, fat: 0.2 },
  { id: "magerquark", name: "Magerquark", category: "milchprodukt", kcal: 67, protein: 12, carbs: 4, fat: 0.3 },
  { id: "griech-joghurt", name: "Griechischer Joghurt 2 %", category: "milchprodukt", kcal: 73, protein: 10, carbs: 3.6, fat: 2 },
  { id: "huettenkaese", name: "Hüttenkäse light", category: "milchprodukt", kcal: 74, protein: 12.5, carbs: 2.6, fat: 1.5 },
  { id: "haehnchen", name: "Hähnchenbrust", category: "protein", kcal: 105, protein: 23, carbs: 0, fat: 1.2 },
  { id: "pute", name: "Putenbrust", category: "protein", kcal: 107, protein: 24, carbs: 0, fat: 1 },
  { id: "lachs", name: "Lachsfilet", category: "protein", kcal: 197, protein: 20, carbs: 0, fat: 13 },
  { id: "kabeljau", name: "Kabeljau", category: "protein", kcal: 77, protein: 17.7, carbs: 0, fat: 0.6 },
  { id: "tofu", name: "Tofu natur", category: "protein", kcal: 122, protein: 13, carbs: 1.5, fat: 7 },
  { id: "eier", name: "Eier (Größe M)", category: "protein", kcal: 137, protein: 12, carbs: 1.5, fat: 9.3 },
  { id: "rinderhack", name: "Rinderhack 5 %", category: "protein", kcal: 121, protein: 21, carbs: 0, fat: 5 },
  // Kohlenhydrate
  { id: "haferflocken", name: "Haferflocken", category: "kohlenhydrate", kcal: 372, protein: 13.5, carbs: 58.7, fat: 7 },
  { id: "vollkornbrot", name: "Vollkornbrot", category: "kohlenhydrate", kcal: 214, protein: 7.5, carbs: 38, fat: 1.6 },
  { id: "reis", name: "Basmatireis (gekocht)", category: "kohlenhydrate", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: "kartoffeln", name: "Kartoffeln", category: "kohlenhydrate", kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: "suesskartoffel", name: "Süßkartoffel", category: "kohlenhydrate", kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: "vk-nudeln", name: "Vollkornnudeln (gekocht)", category: "kohlenhydrate", kcal: 149, protein: 6, carbs: 28, fat: 1.1 },
  { id: "quinoa", name: "Quinoa (gekocht)", category: "kohlenhydrate", kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
  // Fett
  { id: "mandeln", name: "Mandeln", category: "fett", kcal: 579, protein: 21, carbs: 9, fat: 50 },
  { id: "walnuesse", name: "Walnüsse", category: "fett", kcal: 654, protein: 15, carbs: 7, fat: 65 },
  { id: "olivenoel", name: "Olivenöl", category: "fett", kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: "avocado", name: "Avocado", category: "fett", kcal: 160, protein: 2, carbs: 2, fat: 15 },
  { id: "erdnussmus", name: "Erdnussmus", category: "fett", kcal: 598, protein: 25, carbs: 13, fat: 49 },
  // Gemüse
  { id: "brokkoli", name: "Brokkoli", category: "gemuese", kcal: 34, protein: 2.8, carbs: 4, fat: 0.4 },
  { id: "paprika", name: "Paprika", category: "gemuese", kcal: 31, protein: 1, carbs: 6, fat: 0.3 },
  { id: "zucchini", name: "Zucchini", category: "gemuese", kcal: 17, protein: 1.2, carbs: 2.2, fat: 0.3 },
  { id: "spinat", name: "Blattspinat", category: "gemuese", kcal: 23, protein: 2.9, carbs: 1.4, fat: 0.4 },
  { id: "gurke", name: "Gurke", category: "gemuese", kcal: 15, protein: 0.7, carbs: 2.2, fat: 0.1 },
  // Obst
  { id: "beeren", name: "Beerenmix (TK)", category: "obst", kcal: 45, protein: 1, carbs: 8, fat: 0.4 },
  { id: "apfel", name: "Apfel", category: "obst", kcal: 52, protein: 0.3, carbs: 12, fat: 0.2 },
  { id: "banane", name: "Banane", category: "obst", kcal: 89, protein: 1.1, carbs: 20, fat: 0.3 },
];

const checkInRaw: [string, number, number, number, number, number, number, string][] = [
  ["2026-07-07", 74.6, 104.0, 86.0, 6, 6, 6, "Startwoche – Plan gut verständlich, Frühstück noch ungewohnt."],
  ["2026-07-14", 74.1, 103.8, 85.6, 6, 7, 6, "Abends etwas Hunger, Snack nach vorne gezogen."],
  ["2026-07-21", 73.9, 103.5, 85.1, 7, 6, 7, "Training A fühlt sich gut an."],
  ["2026-07-28", 73.4, 103.1, 84.6, 7, 5, 7, ""],
  ["2026-08-04", 73.5, 103.0, 84.4, 6, 6, 5, "Wenig Schlaf wegen Projektabgabe."],
  ["2026-08-11", 72.9, 102.6, 83.8, 7, 5, 7, "Rezepte aus der Liste nachgekocht – sehr lecker."],
  ["2026-08-18", 72.6, 102.2, 83.4, 8, 5, 7, ""],
  ["2026-08-25", 72.2, 101.9, 83.0, 8, 4, 8, "Urlaubswoche, trotzdem Schritte geschafft."],
  ["2026-09-01", 72.3, 101.8, 82.7, 7, 5, 7, "Nach Urlaub etwas Wasser."],
  ["2026-09-08", 71.6, 101.3, 82.2, 8, 4, 8, ""],
  ["2026-09-15", 71.3, 101.0, 81.8, 8, 5, 8, "Kniebeugen auf 40 kg gesteigert."],
  ["2026-09-22", 70.9, 100.7, 81.4, 7, 5, 7, "Hunger am Wochenende höher."],
  ["2026-09-29", 70.6, 100.4, 81.1, 8, 4, 8, "Energie top, Hose sitzt lockerer."],
];

const checkIns: CheckIn[] = checkInRaw.map(
  ([date, weight, hip, waist, energy, hunger, sleep, feedback], i) => ({
    id: `ci-${i + 1}`,
    date,
    weight,
    hip,
    waist,
    energy,
    hunger,
    sleep,
    feedback,
    author: "klientin",
  }),
);

const dailyLogs: DailyLog[] = [
  { date: "2026-09-30", steps: 9412 },
  { date: "2026-10-01", steps: 7835 },
  { date: "2026-10-02", steps: 10764 },
  { date: "2026-10-03", steps: 12108 },
  { date: "2026-10-04", steps: 6390 },
  { date: "2026-10-05", steps: 8957 },
  { date: "2026-10-06", steps: 4281 },
];

const plans: WorkoutPlan[] = [
  {
    id: "A",
    name: "Ganzkörper A",
    focus: "Kniebeuge & Drücken",
    exercises: [
      { id: "a1", name: "Kniebeuge (Langhantel)", sets: 3, reps: "8–10", weight: 40 },
      { id: "a2", name: "Bankdrücken (Kurzhantel)", sets: 3, reps: "8–10", weight: 10 },
      { id: "a3", name: "Rudern am Kabelzug", sets: 3, reps: "10–12", weight: 32.5 },
      { id: "a4", name: "Ausfallschritte", sets: 3, reps: "10 je Bein", weight: 8 },
      { id: "a5", name: "Plank", sets: 3, reps: "40 s", weight: 0 },
    ],
  },
  {
    id: "B",
    name: "Ganzkörper B",
    focus: "Hüfte & Ziehen",
    exercises: [
      { id: "b1", name: "Rumänisches Kreuzheben", sets: 3, reps: "8–10", weight: 35 },
      { id: "b2", name: "Latzug", sets: 3, reps: "10–12", weight: 30 },
      { id: "b3", name: "Schulterdrücken (Kurzhantel)", sets: 3, reps: "10", weight: 7 },
      { id: "b4", name: "Hip Thrust", sets: 3, reps: "10–12", weight: 50 },
      { id: "b5", name: "Dead Bug", sets: 3, reps: "12", weight: 0 },
    ],
  },
];

function logFrom(
  id: string,
  date: string,
  plan: WorkoutPlan,
  delta: number,
  note: string,
): WorkoutLog {
  return {
    id,
    date,
    planId: plan.id,
    note,
    entries: plan.exercises.map((e) => ({
      exerciseId: e.id,
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight > 0 ? Math.max(0, e.weight - delta) : 0,
    })),
  };
}

const workoutLogs: WorkoutLog[] = [
  logFrom("w-1", "2026-08-24", plans[0], 7.5, ""),
  logFrom("w-2", "2026-08-27", plans[1], 7.5, "Hotel-Gym, leichtere Gewichte."),
  logFrom("w-3", "2026-08-31", plans[0], 5, ""),
  logFrom("w-4", "2026-09-03", plans[1], 5, ""),
  logFrom("w-5", "2026-09-07", plans[0], 5, ""),
  logFrom("w-6", "2026-09-10", plans[1], 2.5, ""),
  logFrom("w-7", "2026-09-14", plans[0], 2.5, "Kniebeuge sauber, nächstes Mal steigern."),
  logFrom("w-8", "2026-09-17", plans[1], 2.5, ""),
  logFrom("w-9", "2026-09-21", plans[0], 0, ""),
  logFrom("w-10", "2026-09-24", plans[1], 0, ""),
  logFrom("w-11", "2026-09-28", plans[0], 0, ""),
  logFrom("w-12", "2026-10-01", plans[1], 0, "Hip Thrust fühlt sich stark an."),
  logFrom("w-13", "2026-10-05", plans[0], 0, ""),
];

export const seedData: HubData = {
  profile: {
    name: "Elena",
    startDate: "2026-07-07",
    startWeight: 74.6,
    goalWeight: 66,
    heightCm: 168,
    coachName: "Coach",
  },
  targets: {
    kcalMin: 1650,
    kcalMax: 1700,
    proteinMin: 110,
    proteinMax: 120,
    fatMin: 50,
    fatMax: 60,
    stepGoal: 9000,
    workoutsPerWeek: 2,
  },
  foods,
  meals: [
    {
      slot: "fruehstueck",
      title: "Frühstück",
      items: [
        { id: "m1", foodId: "skyr", grams: 250 },
        { id: "m2", foodId: "haferflocken", grams: 40 },
        { id: "m3", foodId: "beeren", grams: 120 },
        { id: "m4", foodId: "walnuesse", grams: 10 },
      ],
    },
    {
      slot: "mittagessen",
      title: "Mittagessen",
      items: [
        { id: "m5", foodId: "haehnchen", grams: 150 },
        { id: "m6", foodId: "reis", grams: 160 },
        { id: "m7", foodId: "brokkoli", grams: 200 },
        { id: "m8", foodId: "olivenoel", grams: 10 },
      ],
    },
    {
      slot: "snack",
      title: "Snack",
      items: [
        { id: "m9", foodId: "huettenkaese", grams: 150 },
        { id: "m10", foodId: "apfel", grams: 150 },
        { id: "m11", foodId: "mandeln", grams: 15 },
      ],
    },
    {
      slot: "abendessen",
      title: "Abendessen",
      items: [
        { id: "m12", foodId: "lachs", grams: 120 },
        { id: "m13", foodId: "kartoffeln", grams: 200 },
        { id: "m14", foodId: "zucchini", grams: 200 },
        { id: "m15", foodId: "spinat", grams: 80 },
      ],
    },
  ],
  checkIns,
  dailyLogs,
  plans,
  workoutLogs,
  documents: [
    { id: "d1", title: "Ernährungsplan Phase 2", category: "ernaehrungsplan", date: "2026-09-01", addedBy: "coach", description: "1.650–1.700 kcal, 110–120 g Protein, inkl. Tauschliste.", fileName: "Ernaehrungsplan_Phase2.pdf", sizeKb: 412 },
    { id: "d2", title: "Ernährungsplan Phase 1", category: "ernaehrungsplan", date: "2026-07-07", addedBy: "coach", description: "Startplan mit 1.750 kcal.", fileName: "Ernaehrungsplan_Phase1.pdf", sizeKb: 388 },
    { id: "d3", title: "Einkaufsliste KW 41", category: "einkaufsliste", date: "2026-10-05", addedBy: "coach", description: "Basis für Frühstück, Meal Prep Mittag und 3 Abendessen.", fileName: "Einkaufsliste_KW41.pdf", sizeKb: 96 },
    { id: "d4", title: "Einkaufsliste KW 40", category: "einkaufsliste", date: "2026-09-28", addedBy: "klientin", description: "Ergänzt um Tofu und Quinoa.", fileName: "Einkaufsliste_KW40.pdf", sizeKb: 91 },
    { id: "d5", title: "Protein-Overnight-Oats", category: "rezept", date: "2026-08-11", addedBy: "coach", description: "ca. 410 kcal · 34 g Protein", fileName: "Rezept_Overnight_Oats.pdf", sizeKb: 210 },
    { id: "d6", title: "Ofenlachs mit Kartoffeln", category: "rezept", date: "2026-08-18", addedBy: "coach", description: "ca. 520 kcal · 32 g Protein", fileName: "Rezept_Ofenlachs.pdf", sizeKb: 245 },
    { id: "d7", title: "Trainingsanleitung Ganzkörper A/B", category: "pdf", date: "2026-07-07", addedBy: "coach", description: "Technikhinweise und Progressionsregeln.", fileName: "Training_Ganzkoerper.pdf", sizeKb: 1340 },
    { id: "d8", title: "Fortschrittsbericht August", category: "fortschrittsbericht", date: "2026-09-01", addedBy: "coach", description: "−2,3 kg, −2,2 cm Hüfte, −3,3 cm Bauch seit Start.", fileName: "Fortschritt_August.pdf", sizeKb: 520 },
  ],
  coachNotes: [
    { id: "n1", date: "2026-09-29", type: "anpassung", text: "Kalorien bleiben bei 1.650–1.700 kcal. Tempo von ca. 0,35 kg/Woche ist ideal – keine Reduktion nötig.", done: false },
    { id: "n2", date: "2026-09-22", type: "empfehlung", text: "Am Wochenende höherer Hunger: 30 g Protein mehr am Samstagmittag (z. B. Skyr-Bowl), dafür Snack-Mandeln reduzieren.", done: false },
    { id: "n3", date: "2026-09-29", type: "naechster-schritt", text: "Kniebeuge auf 42,5 kg und Hip Thrust auf 55 kg steigern, wenn alle Sätze sauber.", done: false },
    { id: "n4", date: "2026-09-15", type: "naechster-schritt", text: "Neue Vorher-/Nachher-Fotos zum 3-Monats-Check am 06.10. anfragen.", done: false },
    { id: "n5", date: "2026-08-04", type: "empfehlung", text: "Schlafroutine: Bildschirm 30 min vor dem Schlafen aus, Magnesium optional.", done: true },
  ],
};
