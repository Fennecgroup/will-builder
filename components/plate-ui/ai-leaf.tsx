'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { PlateLeaf } from '@udecode/plate/react';

/**
 * PendingAILeaf - Yellow highlight with dashed border for pending changes
 */
export function PendingAILeaf({ children, attributes, ...props }: any) {
  return (
    <PlateLeaf
      {...props}
      attributes={attributes}
      as="span"
      className={cn(
        'rounded px-1 py-0.5',
        'bg-yellow-100 dark:bg-yellow-900/30',
        'border-2 border-dashed border-yellow-400 dark:border-yellow-600',
        'opacity-75',
        'transition-all duration-200'
      )}
    >
      {children}
    </PlateLeaf>
  );
}

/**
 * AILeaf - Purple highlight for confirmed AI changes
 */
export function AILeaf({ children, attributes, leaf, ...props }: any) {
  const isPending = (leaf as any).pending;

  if (isPending) {
    return <PendingAILeaf attributes={attributes} leaf={leaf} {...props}>{children}</PendingAILeaf>;
  }

  return (
    <PlateLeaf
      {...props}
      attributes={attributes}
      as="span"
      className={cn(
        'rounded bg-purple-100 dark:bg-purple-900/30',
        'text-purple-900 dark:text-purple-100',
        'border-b-2 border-purple-300 dark:border-purple-700'
      )}
    >
      {children}
    </PlateLeaf>
  );
}
