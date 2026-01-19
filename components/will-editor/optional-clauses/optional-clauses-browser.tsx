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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OptionalClauseDefinition, OptionalClauseSelection, OptionalClauseType } from '@/lib/types/optional-clauses';
import {
  OPTIONAL_CLAUSES,
  getCategories,
  getClausesByCategory,
} from '@/lib/optional-clauses/clause-definitions';
import { ClauseDetailView } from './clause-detail-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';

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
      <DialogContent className="w-[95vw] !max-w-[1600px] h-[90vh] overflow-hidden flex flex-col">
        {viewMode === 'browse' ? (
          <div className="flex flex-col flex-1 overflow-hidden">
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

            <Tabs defaultValue="all" className="mt-4 flex flex-col flex-1 overflow-hidden">
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

              <TabsContent value="all" className="mt-4 overflow-auto flex-1 h-full min-h-0">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[25%]">Clause</TableHead>
                      <TableHead className="w-[45%]">Description</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="w-[20%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {OPTIONAL_CLAUSES.map((clause) => {
                      const isSelected = isClauseSelected(clause.type);
                      const isCompleted = isClauseCompleted(clause.type);

                      return (
                        <TableRow
                          key={clause.type}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleViewDetails(clause)}
                        >
                          <TableCell className="font-medium">
                            <div className="line-clamp-2">{clause.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {clause.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSelected && (
                              <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
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
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant={isSelected ? 'outline' : 'default'}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggle(clause.type);
                                }}
                              >
                                {isSelected ? (
                                  <>Remove</>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(clause);
                                }}
                              >
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>

              {categories.map((cat) => {
                const clauses = getClausesByCategory(cat.category);
                return (
                  <TabsContent
                    key={cat.category}
                    value={cat.category}
                    className="mt-4 overflow-auto flex-1 h-full min-h-0"
                  >
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[25%]">Clause</TableHead>
                          <TableHead className="w-[45%]">Description</TableHead>
                          <TableHead className="w-[10%]">Status</TableHead>
                          <TableHead className="w-[20%] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clauses.map((clause) => {
                          const isSelected = isClauseSelected(clause.type);
                          const isCompleted = isClauseCompleted(clause.type);

                          return (
                            <TableRow
                              key={clause.type}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleViewDetails(clause)}
                            >
                              <TableCell className="font-medium">
                                <div className="line-clamp-2">{clause.title}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                  {clause.description}
                                </div>
                              </TableCell>
                              <TableCell>
                                {isSelected && (
                                  <Badge variant={isCompleted ? 'default' : 'secondary'} className="text-xs">
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
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant={isSelected ? 'outline' : 'default'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggle(clause.type);
                                    }}
                                  >
                                    {isSelected ? (
                                      <>Remove</>
                                    ) : (
                                      <>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(clause);
                                    }}
                                  >
                                    Details
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
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
