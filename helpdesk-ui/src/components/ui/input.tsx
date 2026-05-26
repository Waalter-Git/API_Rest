import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-2 text-sm text-zinc-50 outline-none ring-0 placeholder:text-zinc-500 focus:border-cyan-300/40 focus:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Input };
