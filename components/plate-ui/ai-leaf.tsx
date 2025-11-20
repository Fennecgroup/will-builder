'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate/react';

export function AILeaf({ className, children, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      className={cn(
        'relative bg-purple-100 dark:bg-purple-900/30 border-b-2 border-purple-400 dark:border-purple-500',
        'after:absolute after:inset-0 after:animate-shimmer',
        'after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent',
        'after:bg-[length:200%_100%]',
        className
      )}
      {...props}
    >
      {children}
    </PlateLeaf>
  );
}
