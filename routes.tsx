import type { ReactElement } from "react";
import {
  LayoutDashboard,
  Salad,
  ClipboardCheck,
  TrendingDown,
  Dumbbell,
  FolderOpen,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import { HomePage } from "@/pages/home";
import { NutritionPage } from "@/pages/nutrition";
import { CheckInPage } from "@/pages/check-in";
import { ProgressPage } from "@/pages/progress";
import { TrainingPage } from "@/pages/training";
import { DocumentsPage } from "@/pages/documents";
import { CoachNotesPage } from "@/pages/coach-notes";

export interface AppRoute {
  path: string;
  element: ReactElement;
  label?: string;
  short?: string;
  icon?: LucideIcon;
  coachOnly?: boolean;
}

// Single source of truth for routes + navigation.
export const routes: AppRoute[] = [
  { path: "/", element: <HomePage />, label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { path: "/ernaehrung", element: <NutritionPage />, label: "Ernährungsplan", short: "Ernährung", icon: Salad },
  { path: "/check-in", element: <CheckInPage />, label: "Check-in", short: "Check-in", icon: ClipboardCheck },
  { path: "/fortschritt", element: <ProgressPage />, label: "Fortschritt", short: "Fortschritt", icon: TrendingDown },
  { path: "/training", element: <TrainingPage />, label: "Training", short: "Training", icon: Dumbbell },
  { path: "/dokumente", element: <DocumentsPage />, label: "Dokumente", short: "Dokumente", icon: FolderOpen },
  { path: "/coach", element: <CoachNotesPage />, label: "Coach-Notizen", short: "Notizen", icon: NotebookPen, coachOnly: true },
];
