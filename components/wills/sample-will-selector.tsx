// ============================================
// TEMPORARY DEVELOPMENT FEATURE
// This component is for development/testing only.
// See removal instructions in plan file.
// ============================================

'use client';

import { useState } from 'react';
import { sampleWillOptions } from '@/lib/data/samples';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleWillSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (sampleId: string) => Promise<void>;
  isLoading?: boolean;
}

const complexityConfig = {
  minimal: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Minimal',
  },
  standard: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    label: 'Standard',
  },
  complex: {
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    label: 'Complex',
  },
} as const;

export function SampleWillSelector({
  open,
  onOpenChange,
  onSelect,
  isLoading = false,
}: SampleWillSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>('');

  const handleCreateWill = async () => {
    if (!selectedId) return;
    await onSelect(selectedId);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Sample Will Template</DialogTitle>
          <DialogDescription>
            Choose a sample template for testing. Each template represents a different
            scenario with realistic South African data.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedId} onValueChange={setSelectedId}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleWillOptions.map((sample) => {
              const config = complexityConfig[sample.complexity];
              const isSelected = selectedId === sample.id;

              return (
                <Card
                  key={sample.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary',
                    isSelected && 'border-primary bg-primary/5 shadow-md',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isLoading && setSelectedId(sample.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value={sample.id}
                          id={sample.id}
                          disabled={isLoading}
                          className="mt-1"
                        />
                      </div>
                      <Badge className={config.badge}>{config.label}</Badge>
                    </div>
                    <CardTitle className="text-lg">{sample.title}</CardTitle>
                    <CardDescription>{sample.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {sample.description}
                    </p>
                    <ul className="space-y-2">
                      {sample.highlights.map((highlight, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateWill}
            disabled={!selectedId || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Will with Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
