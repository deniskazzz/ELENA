import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold">Etwas ist schiefgelaufen.</p>
          <Button onClick={() => window.location.reload()}>Neu laden</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
