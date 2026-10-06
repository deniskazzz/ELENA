import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { seedData } from "./seed";
import type {
  CheckIn,
  ClientProfile,
  CoachNote,
  DailyLog,
  Food,
  Exercise,
  HubData,
  HubDocument,
  MealItem,
  MealSlot,
  NutritionTargets,
  ProgressPhoto,
  Role,
  WorkoutLog,
} from "./types";

// Automatisches Speichern: jede Änderung wird sofort im Browser gesichert.
// Ohne verfügbaren Browser-Speicher fällt der Hub auf die laufende Sitzung zurück.
const memory = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return memory.get(k) ?? null;
    }
  },
  setItem: (k, v) => {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      memory.set(k, v);
    }
  },
  removeItem: (k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      memory.delete(k);
    }
  },
};

const uid = () => Math.random().toString(36).slice(2, 10);

interface HubState extends HubData {
  role: Role;
  photos: ProgressPhoto[];
  lastSaved: number | null;
  setRole: (r: Role) => void;
  setTargets: (t: Partial<NutritionTargets>) => void;
  setProfile: (p: Partial<ClientProfile>) => void;
  addFood: (f: Omit<Food, "id" | "custom">) => string;
  updateFood: (id: string, patch: Partial<Omit<Food, "id">>) => void;
  removeFood: (id: string) => boolean;
  updateMealItem: (slot: MealSlot, itemId: string, patch: Partial<MealItem>) => void;
  addMealItem: (slot: MealSlot, foodId: string, grams: number) => void;
  removeMealItem: (slot: MealSlot, itemId: string) => void;
  addCheckIn: (c: Omit<CheckIn, "id">) => void;
  removeCheckIn: (id: string) => void;
  setSteps: (log: DailyLog) => void;
  updateExercise: (planId: "A" | "B", exId: string, patch: Partial<Exercise>) => void;
  addExercise: (planId: "A" | "B") => void;
  removeExercise: (planId: "A" | "B", exId: string) => void;
  logWorkout: (log: Omit<WorkoutLog, "id">) => void;
  removeWorkoutLog: (id: string) => void;
  addDocument: (d: Omit<HubDocument, "id">) => void;
  updateDocument: (id: string, patch: Partial<Omit<HubDocument, "id">>) => void;
  removeDocument: (id: string) => void;
  addCoachNote: (n: Omit<CoachNote, "id" | "done">) => void;
  toggleCoachNote: (id: string) => void;
  removeCoachNote: (id: string) => void;
  addPhoto: (p: Omit<ProgressPhoto, "id">) => void;
  removePhoto: (id: string) => void;
  resetAll: () => void;
}

const stamp = () => ({ lastSaved: Date.now() });

export const useHub = create<HubState>()(
  persist(
    (set, get) => ({
      ...seedData,
      role: "klientin",
      photos: [],
      lastSaved: null,
      setRole: (role) => set({ role }),
      setTargets: (t) => set((s) => ({ targets: { ...s.targets, ...t }, ...stamp() })),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p }, ...stamp() })),
      addFood: (f) => {
        const id = `custom-${uid()}`;
        set((s) => ({ foods: [...s.foods, { ...f, id, custom: true }], ...stamp() }));
        return id;
      },
      updateFood: (id, patch) =>
        set((s) => ({ foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)), ...stamp() })),
      removeFood: (id) => {
        const used = get().meals.some((m) => m.items.some((i) => i.foodId === id));
        if (used) return false;
        set((s) => ({ foods: s.foods.filter((f) => f.id !== id), ...stamp() }));
        return true;
      },
      updateMealItem: (slot, itemId, patch) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.slot !== slot
              ? m
              : { ...m, items: m.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) },
          ),
          ...stamp(),
        })),
      addMealItem: (slot, foodId, grams) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.slot !== slot ? m : { ...m, items: [...m.items, { id: uid(), foodId, grams }] },
          ),
          ...stamp(),
        })),
      removeMealItem: (slot, itemId) =>
        set((s) => ({
          meals: s.meals.map((m) =>
            m.slot !== slot ? m : { ...m, items: m.items.filter((i) => i.id !== itemId) },
          ),
          ...stamp(),
        })),
      addCheckIn: (c) =>
        set((s) => ({
          checkIns: [...s.checkIns, { ...c, id: uid() }].sort((a, b) => a.date.localeCompare(b.date)),
          ...stamp(),
        })),
      removeCheckIn: (id) =>
        set((s) => ({ checkIns: s.checkIns.filter((c) => c.id !== id), ...stamp() })),
      setSteps: (log) =>
        set((s) => {
          const rest = s.dailyLogs.filter((d) => d.date !== log.date);
          return {
            dailyLogs: [...rest, log].sort((a, b) => a.date.localeCompare(b.date)),
            ...stamp(),
          };
        }),
      updateExercise: (planId, exId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : { ...p, exercises: p.exercises.map((e) => (e.id === exId ? { ...e, ...patch } : e)) },
          ),
          ...stamp(),
        })),
      addExercise: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : {
                  ...p,
                  exercises: [
                    ...p.exercises,
                    { id: uid(), name: "Neue Übung", sets: 3, reps: "10", weight: 0 },
                  ],
                },
          ),
          ...stamp(),
        })),
      removeExercise: (planId, exId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId ? p : { ...p, exercises: p.exercises.filter((e) => e.id !== exId) },
          ),
          ...stamp(),
        })),
      logWorkout: (log) =>
        set((s) => ({
          workoutLogs: [...s.workoutLogs, { ...log, id: uid() }].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
          ...stamp(),
        })),
      removeWorkoutLog: (id) =>
        set((s) => ({ workoutLogs: s.workoutLogs.filter((w) => w.id !== id), ...stamp() })),
      addDocument: (d) =>
        set((s) => ({ documents: [{ ...d, id: uid() }, ...s.documents], ...stamp() })),
      updateDocument: (id, patch) =>
        set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)), ...stamp() })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id), ...stamp() })),
      addCoachNote: (n) =>
        set((s) => ({ coachNotes: [{ ...n, id: uid(), done: false }, ...s.coachNotes], ...stamp() })),
      toggleCoachNote: (id) =>
        set((s) => ({
          coachNotes: s.coachNotes.map((n) => (n.id === id ? { ...n, done: !n.done } : n)),
          ...stamp(),
        })),
      removeCoachNote: (id) =>
        set((s) => ({ coachNotes: s.coachNotes.filter((n) => n.id !== id), ...stamp() })),
      addPhoto: (p) => set((s) => ({ photos: [...s.photos, { ...p, id: uid() }] })),
      removePhoto: (id) => set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),
      resetAll: () => set({ ...seedData, photos: [], ...stamp() }),
    }),
    {
      name: "elena-coaching-hub-v1",
      storage: createJSONStorage(() => safeStorage),
      // Dateien liegen separat im Browser-Dateispeicher; Fotos sind nur Sitzungs-Links.
      partialize: (s) => ({
        role: s.role,
        profile: s.profile,
        targets: s.targets,
        foods: s.foods,
        meals: s.meals,
        checkIns: s.checkIns,
        dailyLogs: s.dailyLogs,
        plans: s.plans,
        workoutLogs: s.workoutLogs,
        documents: s.documents,
        coachNotes: s.coachNotes,
        lastSaved: s.lastSaved,
      }),
    },
  ),
);
