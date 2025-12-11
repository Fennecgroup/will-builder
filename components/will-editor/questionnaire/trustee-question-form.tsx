'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { QuestionnaireQuestion, TrusteeAnswer, Trustee } from '@/lib/types/questionnaire';
import { validateSAIDNumber } from '@/lib/utils/sa-id-validation';

interface TrusteeQuestionFormProps {
  question: QuestionnaireQuestion;
  onSubmit: (data: TrusteeAnswer) => void;
}

export function TrusteeQuestionForm({ question, onSubmit }: TrusteeQuestionFormProps) {
  const [includeAlternate, setIncludeAlternate] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onFormSubmit = (data: any) => {
    // Validate primary trustee ID
    const primaryIdValidation = validateSAIDNumber(data.trustee.idNumber);
    if (!primaryIdValidation.isValid) {
      setError('trustee.idNumber', { message: primaryIdValidation.error || 'Invalid ID number' });
      return;
    }

    // Validate alternate trustee ID if provided
    if (includeAlternate && data.alternateTrustee?.idNumber) {
      const alternateIdValidation = validateSAIDNumber(data.alternateTrustee.idNumber);
      if (!alternateIdValidation.isValid) {
        setError('alternateTrustee.idNumber', {
          message: alternateIdValidation.error || 'Invalid ID number',
        });
        return;
      }
    }

    // Get minor beneficiary IDs from context
    const minorBeneficiaryIds = question.context.minorBeneficiaries?.map((b) => b.id) || [];

    // Build answer
    const answer: TrusteeAnswer = {
      trustee: {
        fullName: data.trustee.fullName,
        idNumber: data.trustee.idNumber,
        relationship: data.trustee.relationship,
        phone: data.trustee.phone,
        email: data.trustee.email || undefined,
        address: {
          street: data.trustee.address.street,
          city: data.trustee.address.city,
          state: data.trustee.address.state,
          postalCode: data.trustee.address.postalCode,
          country: 'South Africa',
        },
        forBeneficiaries: minorBeneficiaryIds,
      } as Omit<Trustee, 'id'>,
    };

    if (includeAlternate && data.alternateTrustee?.fullName) {
      answer.alternateTrustee = {
        fullName: data.alternateTrustee.fullName,
        idNumber: data.alternateTrustee.idNumber,
        relationship: data.alternateTrustee.relationship,
        phone: data.alternateTrustee.phone,
        email: data.alternateTrustee.email || undefined,
        address: {
          street: data.alternateTrustee.address.street,
          city: data.alternateTrustee.address.city,
          state: data.alternateTrustee.address.state,
          postalCode: data.alternateTrustee.address.postalCode,
          country: 'South Africa',
        },
        forBeneficiaries: minorBeneficiaryIds,
      } as Omit<Trustee, 'id'>;
    }

    onSubmit(answer);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Primary Trustee */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold">Primary Trustee</h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trustee.fullName">Full Name *</Label>
            <Input id="trustee.fullName" {...register('trustee.fullName', { required: 'Name is required' })} />
            {errors?.trustee && 'fullName' in errors.trustee && errors.trustee.fullName && (
              <span className="text-sm text-red-500">{String((errors.trustee.fullName as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="trustee.idNumber">ID Number *</Label>
            <Input
              id="trustee.idNumber"
              placeholder="e.g., 8001015800089"
              {...register('trustee.idNumber', { required: 'ID is required' })}
            />
            {errors?.trustee && 'idNumber' in errors.trustee && errors.trustee.idNumber && (
              <span className="text-sm text-red-500">{String((errors.trustee.idNumber as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="trustee.relationship">Relationship *</Label>
            <Input
              id="trustee.relationship"
              placeholder="e.g., Sister, Brother, Uncle"
              {...register('trustee.relationship', { required: 'Relationship is required' })}
            />
            {errors?.trustee && 'relationship' in errors.trustee && errors.trustee.relationship && (
              <span className="text-sm text-red-500">{String((errors.trustee.relationship as any).message)}</span>
            )}
          </div>

          <div>
            <Label htmlFor="trustee.phone">Phone *</Label>
            <Input
              id="trustee.phone"
              placeholder="+27..."
              {...register('trustee.phone', { required: 'Phone is required' })}
            />
            {errors?.trustee && 'phone' in errors.trustee && errors.trustee.phone && (
              <span className="text-sm text-red-500">{String((errors.trustee.phone as any).message)}</span>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="trustee.email">Email</Label>
            <Input id="trustee.email" type="email" {...register('trustee.email')} />
          </div>

          <div className="col-span-2">
            <Label htmlFor="trustee.address.street">Street Address *</Label>
            <Input id="trustee.address.street" {...register('trustee.address.street', { required: true })} />
          </div>

          <div>
            <Label htmlFor="trustee.address.city">City *</Label>
            <Input id="trustee.address.city" {...register('trustee.address.city', { required: true })} />
          </div>

          <div>
            <Label htmlFor="trustee.address.state">Province *</Label>
            <Input
              id="trustee.address.state"
              placeholder="e.g., Gauteng"
              {...register('trustee.address.state', { required: true })}
            />
          </div>

          <div>
            <Label htmlFor="trustee.address.postalCode">Postal Code *</Label>
            <Input id="trustee.address.postalCode" {...register('trustee.address.postalCode', { required: true })} />
          </div>
        </div>
      </div>

      {/* Alternate Trustee Option */}
      <div className="flex items-center space-x-2">
        <Checkbox id="includeAlternate" checked={includeAlternate} onCheckedChange={(checked) => setIncludeAlternate(!!checked)} />
        <Label htmlFor="includeAlternate" className="cursor-pointer">
          Add alternate trustee (recommended)
        </Label>
      </div>

      {includeAlternate && (
        <div className="space-y-4 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <h4 className="font-semibold">Alternate Trustee</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alternateTrustee.fullName">Full Name</Label>
              <Input id="alternateTrustee.fullName" {...register('alternateTrustee.fullName')} />
            </div>

            <div>
              <Label htmlFor="alternateTrustee.idNumber">ID Number</Label>
              <Input id="alternateTrustee.idNumber" placeholder="e.g., 8001015800089" {...register('alternateTrustee.idNumber')} />
              {errors?.alternateTrustee && 'idNumber' in errors.alternateTrustee && errors.alternateTrustee.idNumber && (
                <span className="text-sm text-red-500">{String((errors.alternateTrustee.idNumber as any).message)}</span>
              )}
            </div>

            <div>
              <Label htmlFor="alternateTrustee.relationship">Relationship</Label>
              <Input id="alternateTrustee.relationship" placeholder="e.g., Sister, Brother" {...register('alternateTrustee.relationship')} />
            </div>

            <div>
              <Label htmlFor="alternateTrustee.phone">Phone</Label>
              <Input id="alternateTrustee.phone" placeholder="+27..." {...register('alternateTrustee.phone')} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="alternateTrustee.email">Email</Label>
              <Input id="alternateTrustee.email" type="email" {...register('alternateTrustee.email')} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="alternateTrustee.address.street">Street Address</Label>
              <Input id="alternateTrustee.address.street" {...register('alternateTrustee.address.street')} />
            </div>

            <div>
              <Label htmlFor="alternateTrustee.address.city">City</Label>
              <Input id="alternateTrustee.address.city" {...register('alternateTrustee.address.city')} />
            </div>

            <div>
              <Label htmlFor="alternateTrustee.address.state">Province</Label>
              <Input id="alternateTrustee.address.state" placeholder="e.g., Gauteng" {...register('alternateTrustee.address.state')} />
            </div>

            <div>
              <Label htmlFor="alternateTrustee.address.postalCode">Postal Code</Label>
              <Input id="alternateTrustee.address.postalCode" {...register('alternateTrustee.address.postalCode')} />
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
