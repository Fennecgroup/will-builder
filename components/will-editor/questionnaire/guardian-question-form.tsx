'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionnaireQuestion, GuardianAnswer } from '@/lib/types/questionnaire';
import { validateSAIDNumber } from '@/lib/utils/sa-id-validation';
import { Guardian } from '@/lib/types/will';

interface GuardianQuestionFormProps {
  question: QuestionnaireQuestion;
  onSubmit: (data: GuardianAnswer) => void;
}

export function GuardianQuestionForm({ question, onSubmit }: GuardianQuestionFormProps) {
  const [includeAlternate, setIncludeAlternate] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const onFormSubmit = (data: any) => {
    // Validate primary guardian ID
    const primaryIdValidation = validateSAIDNumber(data.guardian.idNumber);
    if (!primaryIdValidation.isValid) {
      setError('guardian.idNumber', { message: primaryIdValidation.error || 'Invalid ID number' });
      return;
    }

    // Validate alternate guardian ID if provided
    if (includeAlternate && data.alternateGuardian?.idNumber) {
      const alternateIdValidation = validateSAIDNumber(data.alternateGuardian.idNumber);
      if (!alternateIdValidation.isValid) {
        setError('alternateGuardian.idNumber', {
          message: alternateIdValidation.error || 'Invalid ID number',
        });
        return;
      }
    }

    // Get minor children IDs from context
    const minorChildrenIds = question.context.minorChildren?.map((c) => c.id) || [];

    // Build answer
    const answer: GuardianAnswer = {
      guardian: {
        fullName: data.guardian.fullName,
        idNumber: data.guardian.idNumber,
        relationship: data.guardian.relationship,
        phone: data.guardian.phone,
        email: data.guardian.email || undefined,
        address: {
          street: data.guardian.address.street,
          city: data.guardian.address.city,
          state: data.guardian.address.state,
          postalCode: data.guardian.address.postalCode,
          country: 'South Africa',
        },
        forChildren: minorChildrenIds,
      } as Omit<Guardian, 'id'>,
    };

    if (includeAlternate && data.alternateGuardian?.fullName) {
      answer.alternateGuardian = {
        fullName: data.alternateGuardian.fullName,
        idNumber: data.alternateGuardian.idNumber,
        relationship: data.alternateGuardian.relationship,
        phone: data.alternateGuardian.phone,
        email: data.alternateGuardian.email || undefined,
        address: {
          street: data.alternateGuardian.address.street,
          city: data.alternateGuardian.address.city,
          state: data.alternateGuardian.address.state,
          postalCode: data.alternateGuardian.address.postalCode,
          country: 'South Africa',
        },
        forChildren: minorChildrenIds,
      } as Omit<Guardian, 'id'>;
    }

    onSubmit(answer);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> The guardian you nominate here will serve as a backup guardian.
          They will only assume guardianship if no natural parental guardian is available at the
          time of your passing. This ensures your children are cared for in all circumstances.
        </p>
      </div>

      {/* Primary Guardian */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold">Primary Guardian</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guardian.fullName">Full Name *</Label>
            <Input id="guardian.fullName" {...register('guardian.fullName', { required: 'Name is required' })} />
            {errors?.guardian && 'fullName' in errors.guardian && errors.guardian.fullName && (
              <span className="text-sm text-red-500">{String((errors.guardian.fullName as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="guardian.idNumber">ID Number *</Label>
            <Input
              id="guardian.idNumber"
              placeholder="e.g., 8001015800089"
              {...register('guardian.idNumber', { required: 'ID is required' })}
            />
            {errors?.guardian && 'idNumber' in errors.guardian && errors.guardian.idNumber && (
              <span className="text-sm text-red-500">{String((errors.guardian.idNumber as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="guardian.relationship">Relationship *</Label>
            <Input
              id="guardian.relationship"
              placeholder="e.g., Sister, Brother, Uncle"
              {...register('guardian.relationship', { required: 'Relationship is required' })}
            />
            {errors?.guardian && 'relationship' in errors.guardian && errors.guardian.relationship && (
              <span className="text-sm text-red-500">{String((errors.guardian.relationship as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="guardian.phone">Phone *</Label>
            <Input
              id="guardian.phone"
              placeholder="+27..."
              {...register('guardian.phone', { required: 'Phone is required' })}
            />
            {errors?.guardian && 'phone' in errors.guardian && errors.guardian.phone && (
              <span className="text-sm text-red-500">{String((errors.guardian.phone as any).message)}</span>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="guardian.email">Email</Label>
            <Input id="guardian.email" type="email" {...register('guardian.email')} />
          </div>

          <div className="col-span-2">
            <Label htmlFor="guardian.address.street">Street Address *</Label>
            <Input id="guardian.address.street" {...register('guardian.address.street', { required: true })} />
          </div>

          <div>
            <Label htmlFor="guardian.address.city">City *</Label>
            <Input id="guardian.address.city" {...register('guardian.address.city', { required: true })} />
          </div>

          <div>
            <Label htmlFor="guardian.address.state">Province *</Label>
            <Input
              id="guardian.address.state"
              placeholder="e.g., Gauteng"
              {...register('guardian.address.state', { required: true })}
            />
          </div>

          <div>
            <Label htmlFor="guardian.address.postalCode">Postal Code *</Label>
            <Input id="guardian.address.postalCode" {...register('guardian.address.postalCode', { required: true })} />
          </div>
        </div>
      </div>

      {/* Alternate Guardian Option */}
      <div className="flex items-center space-x-2">
        <Checkbox id="includeAlternate" checked={includeAlternate} onCheckedChange={(checked) => setIncludeAlternate(!!checked)} />
        <Label htmlFor="includeAlternate" className="cursor-pointer">
          Add alternate guardian (recommended)
        </Label>
      </div>

      {includeAlternate && (
        <div className="space-y-4 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <h4 className="font-semibold">Alternate Guardian</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alternateGuardian.fullName">Full Name</Label>
              <Input id="alternateGuardian.fullName" {...register('alternateGuardian.fullName')} />
            </div>

            <div>
              <Label htmlFor="alternateGuardian.idNumber">ID Number</Label>
              <Input id="alternateGuardian.idNumber" placeholder="e.g., 8001015800089" {...register('alternateGuardian.idNumber')} />
              {errors?.alternateGuardian && 'idNumber' in errors.alternateGuardian && errors.alternateGuardian.idNumber && (
                <span className="text-sm text-red-500">{String((errors.alternateGuardian.idNumber as any).message)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="alternateGuardian.relationship">Relationship</Label>
              <Input id="alternateGuardian.relationship" placeholder="e.g., Sister, Brother" {...register('alternateGuardian.relationship')} />
            </div>

            <div>
              <Label htmlFor="alternateGuardian.phone">Phone</Label>
              <Input id="alternateGuardian.phone" placeholder="+27..." {...register('alternateGuardian.phone')} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="alternateGuardian.email">Email</Label>
              <Input id="alternateGuardian.email" type="email" {...register('alternateGuardian.email')} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="alternateGuardian.address.street">Street Address</Label>
              <Input id="alternateGuardian.address.street" {...register('alternateGuardian.address.street')} />
            </div>

            <div>
              <Label htmlFor="alternateGuardian.address.city">City</Label>
              <Input id="alternateGuardian.address.city" {...register('alternateGuardian.address.city')} />
            </div>

            <div>
              <Label htmlFor="alternateGuardian.address.state">Province</Label>
              <Input id="alternateGuardian.address.state" placeholder="e.g., Gauteng" {...register('alternateGuardian.address.state')} />
            </div>

            <div>
              <Label htmlFor="alternateGuardian.address.postalCode">Postal Code</Label>
              <Input id="alternateGuardian.address.postalCode" {...register('alternateGuardian.address.postalCode')} />
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
