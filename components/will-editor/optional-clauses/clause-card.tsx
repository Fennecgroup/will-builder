'use client';

import { OptionalClauseDefinition } from '@/lib/types/optional-clauses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ClauseCardProps {
  clause: OptionalClauseDefinition;
  isSelected: boolean;
  isCompleted?: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}

export function ClauseCard({
  clause,
  isSelected,
  isCompleted = false,
  onToggle,
  onViewDetails,
}: ClauseCardProps) {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons as any)[clause.icon] || LucideIcons.FileText;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base line-clamp-1">{clause.title}</CardTitle>
              {isSelected && (
                <Badge
                  variant={isCompleted ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {isCompleted ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Added
                    </>
                  ) : (
                    'Incomplete'
                  )}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 line-clamp-2">
              {clause.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button
            variant={isSelected ? 'outline' : 'default'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? (
              <>Remove from Will</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add to Will
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
