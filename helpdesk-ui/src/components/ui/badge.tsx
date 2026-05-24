import * as React from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="badge"
      className={cn('inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-zinc-200', className)}
      {...props}
    />
  );
}

export { Badge };
