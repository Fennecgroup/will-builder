'use client';

import { OptionalClauseSelection } from '@/lib/types/optional-clauses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Plus } from 'lucide-react';
import { getClauseDefinition } from '@/lib/optional-clauses/clause-definitions';

interface OptionalClausesStatusProps {
  selectedClauses: OptionalClauseSelection[];
  onOpenBrowser: () => void;
}

export function OptionalClausesStatus({
  selectedClauses,
  onOpenBrowser,
}: OptionalClausesStatusProps) {
  const selectedCount = selectedClauses.filter((c) => c.isSelected).length;
  const completedCount = selectedClauses.filter(
    (c) => c.isSelected && c.questionnaireCompleted
  ).length;
  const incompleteCount = selectedCount - completedCount;

  if (selectedCount === 0) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenBrowser}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Optional Clauses</CardTitle>
          <CardDescription className="text-xs">
            Add optional clauses to customize your will
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full" onClick={onOpenBrowser}>
            <Plus className="h-4 w-4 mr-2" />
            Browse Clauses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenBrowser}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Optional Clauses</CardTitle>
          <Badge variant="secondary">{selectedCount}</Badge>
        </div>
        <CardDescription className="text-xs">
          {completedCount === selectedCount
            ? 'All clauses completed'
            : `${incompleteCount} incomplete`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {selectedClauses
          .filter((c) => c.isSelected)
          .map((clause) => {
            const definition = getClauseDefinition(clause.clauseType);
            if (!definition) return null;

            return (
              <div
                key={clause.clauseType}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {clause.questionnaireCompleted ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">{definition.title}</span>
                </div>
              </div>
            );
          })}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBrowser();
          }}
        >
          Manage Clauses
        </Button>
      </CardContent>
    </Card>
  );
}
