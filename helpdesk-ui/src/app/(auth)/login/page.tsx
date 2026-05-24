'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isReady } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isReady, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel autenticar a sessao.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-zinc-300 shadow-2xl backdrop-blur">
          Preparando autenticacao...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,_#020617_0%,_#09090b_60%,_#111111_100%)] text-zinc-50">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="hidden pr-12 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            <ShieldCheck className="size-4" />
            Secure access to Helpdesk operations
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-tight tracking-tight text-white">
            Controle corporativo com login seguro, visibilidade operacional e navegação protegida.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-300">
            Entre para acessar tickets, ativos e fluxos administrativos sob uma interface otimizada para o App Router.
          </p>
          <div className="mt-10 grid max-w-2xl gap-4 text-sm text-zinc-300 sm:grid-cols-2">
            {[
              'JWT persistido com refresh da sessao via contexto global',
              'Redirecionamento automatico quando a sessao estiver ativa',
              'Cliente HTTP com Authorization injectado por interceptor',
              'Layout protegido para visao operacional do dashboard',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">Authentication</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Access portal</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Use suas credenciais para iniciar a sessao do painel.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-medium text-zinc-200">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-zinc-50 outline-none ring-0 placeholder:text-zinc-500 focus:border-cyan-300/40 focus:bg-zinc-950"
                placeholder="seu.email@empresa.com"
                required
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-zinc-200">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 text-zinc-50 outline-none ring-0 placeholder:text-zinc-500 focus:border-cyan-300/40 focus:bg-zinc-950"
                placeholder="Sua senha"
                required
              />
            </label>

            {errorMessage ? (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="w-full justify-center gap-2 rounded-2xl bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Enter dashboard'}
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
