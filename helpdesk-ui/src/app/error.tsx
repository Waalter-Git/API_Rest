'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: Readonly<AppErrorPageProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.16),_transparent_34%),linear-gradient(180deg,_#020617_0%,_#09090b_60%,_#111111_100%)] px-4 py-10 text-zinc-50">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-200 ring-1 ring-rose-300/20">
            <ShieldAlert className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-200/70">Application boundary</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Something interrupted the flow</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
              The interface encountered an unexpected fault while rendering a protected route. You can retry the current operation
              without leaving this session.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" />
            <div>
              <p className="font-medium text-zinc-100">Controlled recovery</p>
              <p className="mt-1 leading-6">The retry action refreshes the current route and re-runs the server/client pipeline.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-cyan-300" />
            <div>
              <p className="font-medium text-zinc-100">Safe boundary reset</p>
              <p className="mt-1 leading-6">Use the button below to request a fresh render after the failure condition is cleared.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            {error.digest ? `Error digest: ${error.digest}` : 'Error digest unavailable'}
          </p>

          <Button
            type="button"
            size="lg"
            onClick={reset}
            className="justify-center gap-2 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
          >
            <RefreshCw className="size-4" />
            Retry operation
          </Button>
        </div>
      </div>
    </div>
  );
}