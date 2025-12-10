'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutoFillNotificationProps {
  suggestionCount: number;
  onOpenPreview: () => void;
}

/**
 * Auto-Fill Notification Badge
 * Displays in the will editor toolbar when auto-fill suggestions are available
 */
export function AutoFillNotification({
  suggestionCount,
  onOpenPreview,
}: AutoFillNotificationProps) {
  if (suggestionCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreview}
            className="relative animate-pulse hover:animate-none"
          >
            <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
            Auto-Fill Available
            <Badge
              variant="secondary"
              className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            >
              {suggestionCount}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {suggestionCount} section{suggestionCount > 1 ? 's' : ''} can be
            auto-filled from your data
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
