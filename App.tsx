import { HashRouter, Route, Routes } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ConfirmDialogProvider } from "@/components/confirm-dialog";
import { AppShell } from "@/components/app-shell";
import { NotFoundPage } from "@/pages/not-found";
import { routes } from "@/routes";

// HashRouter: funktioniert auf GitHub Pages und jedem statischen Hosting
// ohne Server-Konfiguration (URLs wie /#/ernaehrung).
export function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ConfirmDialogProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<AppShell />}>
                {routes.map((r) =>
                  r.path === "/" ? (
                    <Route key={r.path} index element={r.element} />
                  ) : (
                    <Route key={r.path} path={r.path} element={r.element} />
                  ),
                )}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
        </ConfirmDialogProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
