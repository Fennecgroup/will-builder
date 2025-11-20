'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface GhostTextProps {
  text: string;
  className?: string;
}

export function GhostText({ text, className }: GhostTextProps) {
  if (!text) return null;

  return (
    <span
      className={cn(
        'text-muted-foreground/50 pointer-events-none select-none',
        className
      )}
      contentEditable={false}
    >
      {text}
    </span>
  );
}

interface GhostTextOverlayProps {
  text: string;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}

export function GhostTextOverlay({
  text,
  onAccept,
  onReject,
  className,
}: GhostTextOverlayProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onAccept();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onReject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAccept, onReject]);

  if (!text) return null;

  return (
    <span
      className={cn(
        'text-muted-foreground/40 italic pointer-events-none',
        className
      )}
      contentEditable={false}
    >
      {text}
      <span className="ml-2 text-xs text-muted-foreground/60">
        Tab to accept
      </span>
    </span>
  );
}
