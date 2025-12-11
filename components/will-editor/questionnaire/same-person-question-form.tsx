'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuestionnaireQuestion, SamePersonAnswer } from '@/lib/types/questionnaire';

interface SamePersonQuestionFormProps {
  question: QuestionnaireQuestion;
  onSubmit: (data: SamePersonAnswer) => void;
}

export function SamePersonQuestionForm({ question, onSubmit }: SamePersonQuestionFormProps) {
  const [choice, setChoice] = useState<string>('');

  const handleSubmit = () => {
    const answer: SamePersonAnswer = {
      useSamePersonForTrustee: choice === 'yes',
      guardianId: choice === 'yes' ? question.context.guardianId : undefined,
    };
    onSubmit(answer);
  };

  return (
    <div className="space-y-6">
      <RadioGroup value={choice} onValueChange={setChoice}>
        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
          <RadioGroupItem value="yes" id="yes" />
          <div className="flex-1">
            <Label htmlFor="yes" className="cursor-pointer">
              <div className="font-semibold">
                Yes, {question.context.guardianName || 'the guardian'} should also serve as trustee
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                The guardian will manage both parental responsibilities and financial inheritance
              </div>
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
          <RadioGroupItem value="no" id="no" />
          <div className="flex-1">
            <Label htmlFor="no" className="cursor-pointer">
              <div className="font-semibold">No, I want to appoint a different trustee</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                You'll be asked to specify a different person to manage finances
              </div>
            </Label>
          </div>
        </div>
      </RadioGroup>

      <Button onClick={handleSubmit} disabled={!choice} className="w-full">
        Continue
      </Button>
    </div>
  );
}
