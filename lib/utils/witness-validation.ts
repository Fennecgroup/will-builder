/**
 * Witness Conflict Validation for South African Wills
 *
 * According to the Wills Act 7 of 1953:
 * - A witness CANNOT be a beneficiary (or their spouse)
 * - A witness CANNOT be an executor (or their spouse)
 * - A witness CANNOT be a guardian (or their spouse)
 * - Minimum age: 14 years old
 * - Must be competent to give evidence in court
 * - All witnesses must be present at the SAME TIME when testator signs
 */

import { WillContent, Witness, Beneficiary, Executor, Guardian } from '@/lib/types/will'

export interface WitnessConflict {
  witnessId: string
  witnessName: string
  conflictType: 'beneficiary' | 'executor' | 'guardian' | 'age' | 'insufficient-witnesses'
  conflictingParty?: string
  severity: 'error' | 'warning'
  message: string
}

/**
 * Validates all witnesses for conflicts according to SA law
 * @param willContent - The complete will content
 * @returns Array of conflicts found (empty if no conflicts)
 */
export function validateWitnesses(willContent: WillContent): WitnessConflict[] {
  const conflicts: WitnessConflict[] = []

  // Check minimum number of witnesses
  if (!willContent.witnesses || willContent.witnesses.length < 2) {
    conflicts.push({
      witnessId: 'general',
      witnessName: 'N/A',
      conflictType: 'insufficient-witnesses',
      severity: 'error',
      message: 'South African law requires a minimum of 2 witnesses. You have ' +
               (willContent.witnesses?.length || 0) + ' witness(es).',
    })
  }

  if (!willContent.witnesses || willContent.witnesses.length === 0) {
    return conflicts
  }

  // Check each witness for conflicts
  willContent.witnesses.forEach((witness) => {
    // Check if witness is a beneficiary
    const isBeneficiary = willContent.beneficiaries.some(
      (b) => issamePerson(witness, b)
    )
    if (isBeneficiary) {
      const beneficiary = willContent.beneficiaries.find((b) => isSamePerson(witness, b))
      conflicts.push({
        witnessId: witness.id,
        witnessName: witness.fullName,
        conflictType: 'beneficiary',
        conflictingParty: beneficiary?.fullName,
        severity: 'error',
        message: `${witness.fullName} is listed as both a witness AND a beneficiary. This invalidates the witness and may invalidate their bequest.`,
      })
    }

    // Check if witness is an executor
    const isExecutor = willContent.executors.some(
      (e) => isSamePerson(witness, e)
    )
    if (isExecutor) {
      const executor = willContent.executors.find((e) => isSamePerson(witness, e))
      conflicts.push({
        witnessId: witness.id,
        witnessName: witness.fullName,
        conflictType: 'executor',
        conflictingParty: executor?.fullName,
        severity: 'error',
        message: `${witness.fullName} is listed as both a witness AND an executor. This is not permitted under South African law.`,
      })
    }

    // Check if witness is a guardian
    const isGuardian = willContent.guardians.some(
      (g) => isSamePerson(witness, g)
    )
    if (isGuardian) {
      const guardian = willContent.guardians.find((g) => isSamePerson(witness, g))
      conflicts.push({
        witnessId: witness.id,
        witnessName: witness.fullName,
        conflictType: 'guardian',
        conflictingParty: guardian?.fullName,
        severity: 'error',
        message: `${witness.fullName} is listed as both a witness AND a guardian. This is not permitted under South African law.`,
      })
    }

    // Check if witness is spouse of testator (beneficiary check)
    if (willContent.marriage.spouse) {
      if (isSamePerson(witness, willContent.marriage.spouse as any)) {
        conflicts.push({
          witnessId: witness.id,
          witnessName: witness.fullName,
          conflictType: 'beneficiary',
          conflictingParty: willContent.marriage.spouse.fullName,
          severity: 'error',
          message: `${witness.fullName} is the testator's spouse and likely a beneficiary. Spouses of beneficiaries cannot be witnesses.`,
        })
      }
    }

    // Age validation (if date of birth is available)
    // Note: SA law requires witnesses to be 14+ years old
    if (witness.idNumber) {
      const { getAgeFromSAID } = require('./sa-id-validation')
      const age = getAgeFromSAID(witness.idNumber)
      if (age !== null && age < 14) {
        conflicts.push({
          witnessId: witness.id,
          witnessName: witness.fullName,
          conflictType: 'age',
          severity: 'error',
          message: `${witness.fullName} is under 14 years old. Witnesses must be at least 14 years old under South African law.`,
        })
      }
    }
  })

  return conflicts
}

/**
 * Checks if two persons are the same based on name and/or ID number
 * @param person1 - First person
 * @param person2 - Second person
 * @returns boolean indicating if they are the same person
 */
function isSamePerson(
  person1: { fullName: string; idNumber?: string },
  person2: { fullName: string; idNumber?: string }
): boolean {
  // If both have ID numbers, use that for comparison
  if (person1.idNumber && person2.idNumber) {
    const id1 = person1.idNumber.replace(/\s+/g, '')
    const id2 = person2.idNumber.replace(/\s+/g, '')
    return id1 === id2
  }

  // Otherwise, use name comparison (case-insensitive, trimmed)
  const name1 = person1.fullName.trim().toLowerCase()
  const name2 = person2.fullName.trim().toLowerCase()
  return name1 === name2
}

/**
 * Validates a specific witness against the will content
 * @param witness - The witness to validate
 * @param willContent - The complete will content
 * @returns Array of conflicts for this specific witness
 */
export function validateSingleWitness(
  witness: Witness,
  willContent: WillContent
): WitnessConflict[] {
  const tempContent = {
    ...willContent,
    witnesses: [witness],
  }
  return validateWitnesses(tempContent).filter((c) => c.witnessId === witness.id)
}

/**
 * Gets summary of witness validation status
 * @param willContent - The complete will content
 * @returns Object with validation summary
 */
export function getWitnessValidationSummary(willContent: WillContent): {
  isValid: boolean
  errorCount: number
  warningCount: number
  conflicts: WitnessConflict[]
  message: string
} {
  const conflicts = validateWitnesses(willContent)
  const errors = conflicts.filter((c) => c.severity === 'error')
  const warnings = conflicts.filter((c) => c.severity === 'warning')

  let message = ''
  if (conflicts.length === 0) {
    message = 'All witnesses are valid and have no conflicts.'
  } else if (errors.length > 0) {
    message = `Found ${errors.length} critical error(s) with witnesses that must be resolved.`
  } else {
    message = `Found ${warnings.length} warning(s) with witnesses.`
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    conflicts,
    message,
  }
}

/**
 * Suggests alternative witnesses (people NOT in beneficiaries, executors, or guardians)
 * This is a helper function to identify who CAN be a witness
 * @param willContent - The complete will content
 * @returns Array of person names who should NOT be witnesses
 */
export function getDisqualifiedWitnesses(willContent: WillContent): string[] {
  const disqualified: string[] = []

  // Add all beneficiaries
  willContent.beneficiaries.forEach((b) => {
    disqualified.push(b.fullName)
  })

  // Add all executors
  willContent.executors.forEach((e) => {
    disqualified.push(e.fullName)
  })

  // Add all guardians
  willContent.guardians.forEach((g) => {
    disqualified.push(g.fullName)
  })

  // Add spouse (if exists)
  if (willContent.marriage.spouse) {
    disqualified.push(willContent.marriage.spouse.fullName)
  }

  // Remove duplicates
  return Array.from(new Set(disqualified))
}

/**
 * Example usage
 */
export const witnessValidationExample = {
  description: 'Example of how to use witness validation',
  usage: `
    import { validateWitnesses, getWitnessValidationSummary } from '@/lib/utils/witness-validation'

    const conflicts = validateWitnesses(willContent)
    console.log('Conflicts found:', conflicts)

    const summary = getWitnessValidationSummary(willContent)
    if (!summary.isValid) {
      console.error('Witness validation failed:', summary.message)
      summary.conflicts.forEach(conflict => {
        console.error('-', conflict.message)
      })
    }
  `,
}
