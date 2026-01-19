'use client';

import { OptionalClauseDefinition } from '@/lib/types/optional-clauses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClauseDetailViewProps {
  clause: OptionalClauseDefinition;
  isSelected: boolean;
  isCompleted?: boolean;
  onToggle: () => void;
  onBack: () => void;
}

export function ClauseDetailView({
  clause,
  isSelected,
  isCompleted = false,
  onToggle,
  onBack,
}: ClauseDetailViewProps) {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons as any)[clause.icon] || LucideIcons.FileText;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to list</span>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{clause.title}</h2>
              <p className="text-sm text-muted-foreground">{clause.description}</p>
            </div>
          </div>
          {isSelected && (
            <Badge
              variant={isCompleted ? 'default' : 'secondary'}
              className="mt-2"
            >
              {isCompleted ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Added to Will
                </>
              ) : (
                'Incomplete - Additional Information Required'
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Legal Description */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Legal Information</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {clause.legalDescription}
            </p>
          </div>
        </div>

        {/* Jurisdiction Support */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Jurisdiction Support</h3>
          <div className="flex gap-2">
            {clause.jurisdictionSupport.map((jurisdiction) => (
              <Badge key={jurisdiction} variant="outline">
                {jurisdiction === 'ZA' ? 'South Africa' : jurisdiction}
              </Badge>
            ))}
          </div>
        </div>

        {/* Required Info Alert */}
        {clause.requiresQuestionnaire && !isCompleted && isSelected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This clause requires additional information. You will be prompted
              to complete a questionnaire after adding it to your will.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant={isSelected ? 'destructive' : 'default'}
          onClick={onToggle}
          className="flex-1"
        >
          {isSelected ? (
            'Remove from Will'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add to Will
            </>
          )}
        </Button>
        {isSelected && !isCompleted && clause.requiresQuestionnaire && (
          <Button variant="outline" onClick={onToggle} className="flex-1">
            Complete Questionnaire
          </Button>
        )}
      </div>
    </div>
  );
}
