'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate/react';

export function AILeaf({ className, children, ...props }: PlateLeafProps) {
  return (
    <PlateLeaf
      className={cn(
        'bg-purple-100 dark:bg-purple-900/30 border-b-2 border-purple-400 dark:border-purple-500',
        className
      )}
      {...props}
    >
      {children}
    </PlateLeaf>
  );
}
