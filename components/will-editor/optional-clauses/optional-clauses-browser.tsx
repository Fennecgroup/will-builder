'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptionalClauseDefinition, OptionalClauseSelection, OptionalClauseType } from '@/lib/types/optional-clauses';
import {
  OPTIONAL_CLAUSES,
  getCategories,
  getClausesByCategory,
} from '@/lib/optional-clauses/clause-definitions';
import { ClauseCard } from './clause-card';
import { ClauseDetailView } from './clause-detail-view';
import { Badge } from '@/components/ui/badge';

interface OptionalClausesBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClauses: OptionalClauseSelection[];
  onClauseToggle: (clauseType: OptionalClauseType, isSelected: boolean) => void;
}

type ViewMode = 'browse' | 'detail';

export function OptionalClausesBrowser({
  open,
  onOpenChange,
  selectedClauses,
  onClauseToggle,
}: OptionalClausesBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedClause, setSelectedClause] = useState<OptionalClauseDefinition | null>(null);

  const categories = getCategories();

  // Check if a clause is selected
  const isClauseSelected = (clauseType: OptionalClauseType): boolean => {
    return selectedClauses.some(
      (c) => c.clauseType === clauseType && c.isSelected
    );
  };

  // Check if a clause is completed
  const isClauseCompleted = (clauseType: OptionalClauseType): boolean => {
    const clause = selectedClauses.find((c) => c.clauseType === clauseType);
    return clause?.questionnaireCompleted ?? false;
  };

  // Handle clause selection/deselection
  const handleToggle = (clauseType: OptionalClauseType) => {
    const isSelected = isClauseSelected(clauseType);
    onClauseToggle(clauseType, !isSelected);
  };

  // Handle viewing clause details
  const handleViewDetails = (clause: OptionalClauseDefinition) => {
    setSelectedClause(clause);
    setViewMode('detail');
  };

  // Handle back to browse
  const handleBack = () => {
    setViewMode('browse');
    setSelectedClause(null);
  };

  // Count total selected clauses
  const selectedCount = selectedClauses.filter((c) => c.isSelected).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {viewMode === 'browse' ? (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Optional Clauses</DialogTitle>
                  <DialogDescription>
                    Browse and add optional clauses to customize your will
                  </DialogDescription>
                </div>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {selectedCount} {selectedCount === 1 ? 'clause' : 'clauses'}{' '}
                    added
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <Tabs defaultValue="all" className="mt-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">
                  All ({OPTIONAL_CLAUSES.length})
                </TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger key={cat.category} value={cat.category}>
                    {cat.label.split(' ')[0]} ({cat.count})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OPTIONAL_CLAUSES.map((clause) => (
                    <ClauseCard
                      key={clause.type}
                      clause={clause}
                      isSelected={isClauseSelected(clause.type)}
                      isCompleted={isClauseCompleted(clause.type)}
                      onToggle={() => handleToggle(clause.type)}
                      onViewDetails={() => handleViewDetails(clause)}
                    />
                  ))}
                </div>
              </TabsContent>

              {categories.map((cat) => {
                const clauses = getClausesByCategory(cat.category);
                return (
                  <TabsContent
                    key={cat.category}
                    value={cat.category}
                    className="space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {clauses.map((clause) => (
                        <ClauseCard
                          key={clause.type}
                          clause={clause}
                          isSelected={isClauseSelected(clause.type)}
                          isCompleted={isClauseCompleted(clause.type)}
                          onToggle={() => handleToggle(clause.type)}
                          onViewDetails={() => handleViewDetails(clause)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </>
        ) : (
          <>
            {selectedClause && (
              <ClauseDetailView
                clause={selectedClause}
                isSelected={isClauseSelected(selectedClause.type)}
                isCompleted={isClauseCompleted(selectedClause.type)}
                onToggle={() => handleToggle(selectedClause.type)}
                onBack={handleBack}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
