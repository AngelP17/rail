/**
 * HMAX-Lite: Error Boundary — System Fault Fallback
 * ==================================================
 *
 * Production-grade error boundary styled to match the SCADA aesthetic.
 * Catches render errors and displays a reloadable fault screen instead
 * of a white screen of death.
 */

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[HMAX ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#06090f] px-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/10">
            <AlertTriangle className="h-8 w-8 text-[#ef4444]" strokeWidth={1.5} />
          </div>
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white">System Fault</h1>
          <p className="mb-8 max-w-sm text-sm text-white/40">
            The operations console encountered an unexpected error and has halted to prevent data corruption.
          </p>

          {this.state.error && (
            <div className="mb-8 max-w-lg overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-white/30">Fault Details</p>
              <code className="block font-mono text-xs text-[#ef4444]">
                {this.state.error.name}: {this.state.error.message}
              </code>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            Reload Console
          </button>

          <p className="mt-6 text-[10px] text-white/20">HMAX-Lite v2.0.0 · OCC Simulation</p>
        </div>
      );
    }

    return this.props.children;
  }
}
