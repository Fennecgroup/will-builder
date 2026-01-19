'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { QuestionnaireQuestion } from '@/lib/types/questionnaire';
import { LivingWillDirectives } from '@/lib/types/optional-clauses';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface LivingWillQuestionFormProps {
  question: QuestionnaireQuestion;
  onSubmit: (data: LivingWillDirectives) => void;
}

export function LivingWillQuestionForm({ question, onSubmit }: LivingWillQuestionFormProps) {
  const [directives, setDirectives] = useState<LivingWillDirectives>({
    noLifeSupportIfTerminal: false,
    organDonation: false,
    painManagement: 'comfort-care',
    resuscitation: true,
    artificialNutrition: false,
    specificInstructions: '',
  });

  const handleSubmit = () => {
    onSubmit(directives);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          These directives will be legally binding and honored when you are unable to make medical
          decisions. Please consult with your healthcare provider and family about these choices.
        </AlertDescription>
      </Alert>

      {/* Terminal Illness - Life Support */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="noLifeSupport"
            checked={directives.noLifeSupportIfTerminal}
            onCheckedChange={(checked) =>
              setDirectives({ ...directives, noLifeSupportIfTerminal: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="noLifeSupport" className="cursor-pointer font-semibold">
              No life support if terminally ill
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              If I am diagnosed with a terminal illness and my death is imminent, I do not want
              life-sustaining measures that would only prolong the dying process.
            </p>
          </div>
        </div>
      </div>

      {/* Organ Donation */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="organDonation"
            checked={directives.organDonation}
            onCheckedChange={(checked) =>
              setDirectives({ ...directives, organDonation: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="organDonation" className="cursor-pointer font-semibold">
              Organ donation consent
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I consent to donate my organs and tissues for transplantation, therapy, medical
              research, or education after my death.
            </p>
          </div>
        </div>
      </div>

      {/* Resuscitation (CPR) */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="resuscitation"
            checked={directives.resuscitation}
            onCheckedChange={(checked) =>
              setDirectives({ ...directives, resuscitation: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="resuscitation" className="cursor-pointer font-semibold">
              Resuscitation (CPR) permitted
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I consent to cardiopulmonary resuscitation (CPR) if my heart or breathing stops.
              Uncheck this if you prefer a Do Not Resuscitate (DNR) order.
            </p>
          </div>
        </div>
      </div>

      {/* Artificial Nutrition */}
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="artificialNutrition"
            checked={directives.artificialNutrition}
            onCheckedChange={(checked) =>
              setDirectives({ ...directives, artificialNutrition: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label htmlFor="artificialNutrition" className="cursor-pointer font-semibold">
              Artificial nutrition and hydration
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              I want to receive artificial nutrition and hydration (feeding tubes) even if I am in
              a permanent vegetative state.
            </p>
          </div>
        </div>
      </div>

      {/* Pain Management */}
      <div className="space-y-3 p-4 border rounded-lg">
        <Label className="font-semibold">Pain Management Preferences</Label>
        <p className="text-sm text-muted-foreground mb-3">
          How should medical professionals manage your pain at end of life?
        </p>
        <RadioGroup
          value={directives.painManagement}
          onValueChange={(value) =>
            setDirectives({
              ...directives,
              painManagement: value as 'comfort-care' | 'aggressive' | 'minimal',
            })
          }
        >
          <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="comfort-care" id="comfort-care" />
            <div className="flex-1">
              <Label htmlFor="comfort-care" className="cursor-pointer">
                <div className="font-medium">Comfort Care (Recommended)</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Prioritize pain relief and comfort, even if it may hasten death
                </div>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="aggressive" id="aggressive" />
            <div className="flex-1">
              <Label htmlFor="aggressive" className="cursor-pointer">
                <div className="font-medium">Aggressive Pain Management</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Use maximum pain relief measures regardless of side effects
                </div>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="minimal" id="minimal" />
            <div className="flex-1">
              <Label htmlFor="minimal" className="cursor-pointer">
                <div className="font-medium">Minimal Intervention</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Use pain medication conservatively to maintain alertness
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Specific Instructions */}
      <div className="space-y-3">
        <Label htmlFor="specificInstructions" className="font-semibold">
          Additional Medical Directives (Optional)
        </Label>
        <Textarea
          id="specificInstructions"
          placeholder="Enter any specific medical instructions, religious considerations, or other end-of-life preferences..."
          value={directives.specificInstructions}
          onChange={(e) =>
            setDirectives({ ...directives, specificInstructions: e.target.value })
          }
          className="min-h-[100px]"
        />
        <p className="text-sm text-muted-foreground">
          You may include specific medical procedures you do or don't want, religious preferences,
          or other important considerations.
        </p>
      </div>

      <Button onClick={handleSubmit} className="w-full">
        Save Living Will Directives
      </Button>
    </div>
  );
}
