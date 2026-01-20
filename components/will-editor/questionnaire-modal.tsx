'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { QuestionnaireOrchestrator } from '@/lib/questionnaire/orchestrator';
import { MissingInfoContext, QuestionnaireQuestion } from '@/lib/types/questionnaire';
import { WillContent } from '@/lib/types/will';
import { GuardianQuestionForm } from './questionnaire/guardian-question-form';
import { TrusteeQuestionForm } from './questionnaire/trustee-question-form';
import { SamePersonQuestionForm } from './questionnaire/same-person-question-form';
import { LivingWillQuestionForm } from './questionnaire/living-will-question-form';

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: MissingInfoContext;
  currentWillContent: WillContent;
  onComplete: (updates: Partial<WillContent>) => void;
}

export function QuestionnaireModal({
  open,
  onOpenChange,
  context,
  currentWillContent,
  onComplete,
}: QuestionnaireModalProps) {
  const [orchestrator, setOrchestrator] = useState<QuestionnaireOrchestrator | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionnaireQuestion | null>(null);

  // Initialize orchestrator
  useEffect(() => {
    if (open && context.questions.length > 0) {
      const orch = new QuestionnaireOrchestrator(context.questions);
      setOrchestrator(orch);
      setCurrentQuestion(orch.getCurrentQuestion());
    }
  }, [open, context]);

  // Handle answer submission
  const handleAnswer = async (data: any) => {
    if (!orchestrator || !currentQuestion) return;

    try {
      orchestrator.answerQuestion(currentQuestion.id, data);

      // Move to next question or complete
      if (orchestrator.isComplete()) {
        const updates = orchestrator.toWillContentUpdates(currentWillContent);
        onComplete(updates);
        onOpenChange(false);
      } else {
        setCurrentQuestion(orchestrator.getCurrentQuestion());
      }
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  // Handle previous button
  const handlePrevious = () => {
    if (orchestrator?.previousQuestion()) {
      setCurrentQuestion(orchestrator.getCurrentQuestion());
    }
  };

  // Handle skip (optional questions only)
  const handleSkip = () => {
    if (orchestrator && currentQuestion && !currentQuestion.required) {
      orchestrator.skipQuestion();
      setCurrentQuestion(orchestrator.getCurrentQuestion());
    }
  };

  if (!orchestrator || !currentQuestion) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {context.priority === 'critical' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            Complete Your Will - Missing Information
          </DialogTitle>
          <DialogDescription>
            We need some additional information to ensure your will is complete and legally valid.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>
              Question {orchestrator.currentQuestionIndex + 1} of {context.questions.length}
            </span>
            <span>{orchestrator.getProgress()}% complete</span>
          </div>
          <Progress value={orchestrator.getProgress()} />
        </div>

        {/* Priority Alert */}
        {context.priority === 'critical' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This information is required for your will to be legally valid in South Africa.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{currentQuestion.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentQuestion.description}
            </p>
          </div>

          {/* Render question-specific form */}
          {currentQuestion.type === 'guardian-appointment' && (
            <GuardianQuestionForm question={currentQuestion} onSubmit={handleAnswer} />
          )}

          {currentQuestion.type === 'trustee-appointment' && (
            <TrusteeQuestionForm question={currentQuestion} onSubmit={handleAnswer} />
          )}

          {currentQuestion.type === 'same-person-guardian-trustee' && (
            <SamePersonQuestionForm question={currentQuestion} onSubmit={handleAnswer} />
          )}

          {currentQuestion.type === 'living-will-directives' && (
            <LivingWillQuestionForm question={currentQuestion} onSubmit={handleAnswer} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={orchestrator.currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {!currentQuestion.required && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
