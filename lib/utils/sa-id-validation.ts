/**
 * South African ID Number Validation Utilities
 *
 * SA ID Format: YYMMDD SSSS C A Z
 * - YYMMDD: Date of birth (6 digits)
 * - SSSS: Sequence number (4 digits) - 0000-4999 for females, 5000-9999 for males
 * - C: Citizenship (1 digit) - 0 for SA citizen, 1 for permanent resident
 * - A: Usually 8 (previously used for race classification, now deprecated)
 * - Z: Checksum digit (1 digit) - Luhn algorithm
 */

/**
 * Validates a South African ID number
 * @param idNumber - The 13-digit SA ID number (can include spaces)
 * @returns Object with validation result and error message if invalid
 */
export function validateSAIDNumber(idNumber: string): {
  isValid: boolean
  error?: string
  dateOfBirth?: string
  gender?: 'male' | 'female'
  citizenship?: 'citizen' | 'permanent-resident'
} {
  // Remove spaces and non-digit characters
  const cleanedId = idNumber.replace(/\s+/g, '').replace(/\D/g, '')

  // Check length
  if (cleanedId.length !== 13) {
    return {
      isValid: false,
      error: 'SA ID number must be exactly 13 digits',
    }
  }

  // Extract components
  const year = cleanedId.substring(0, 2)
  const month = cleanedId.substring(2, 4)
  const day = cleanedId.substring(4, 6)
  const sequenceNumber = parseInt(cleanedId.substring(6, 10), 10)
  const citizenship = cleanedId.substring(10, 11)
  const checksum = cleanedId.substring(12, 13)

  // Validate date
  const monthNum = parseInt(month, 10)
  const dayNum = parseInt(day, 10)

  if (monthNum < 1 || monthNum > 12) {
    return {
      isValid: false,
      error: 'Invalid month in ID number',
    }
  }

  if (dayNum < 1 || dayNum > 31) {
    return {
      isValid: false,
      error: 'Invalid day in ID number',
    }
  }

  // Determine full year (assume current century if year < current 2-digit year, else previous century)
  const currentYear = new Date().getFullYear()
  const currentYearShort = currentYear % 100
  const yearNum = parseInt(year, 10)
  const fullYear = yearNum <= currentYearShort ? 2000 + yearNum : 1900 + yearNum

  // Validate citizenship digit
  if (citizenship !== '0' && citizenship !== '1') {
    return {
      isValid: false,
      error: 'Invalid citizenship digit (must be 0 or 1)',
    }
  }

  // Validate checksum using Luhn algorithm
  const isChecksumValid = validateLuhnChecksum(cleanedId)
  if (!isChecksumValid) {
    return {
      isValid: false,
      error: 'Invalid checksum - ID number is not valid',
    }
  }

  // Determine gender from sequence number
  const gender = sequenceNumber >= 5000 ? 'male' : 'female'

  // Determine citizenship
  const citizenshipStatus = citizenship === '0' ? 'citizen' : 'permanent-resident'

  // Format date of birth
  const dateOfBirth = `${fullYear}-${month}-${day}`

  return {
    isValid: true,
    dateOfBirth,
    gender,
    citizenship: citizenshipStatus,
  }
}

/**
 * Validates checksum using Luhn algorithm (mod 10)
 * @param idNumber - The 13-digit ID number (digits only)
 * @returns boolean indicating if checksum is valid
 */
function validateLuhnChecksum(idNumber: string): boolean {
  let sum = 0
  let alternate = false

  // Start from rightmost digit (excluding checksum) and move left
  for (let i = idNumber.length - 2; i >= 0; i--) {
    let digit = parseInt(idNumber.charAt(i), 10)

    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }

    sum += digit
    alternate = !alternate
  }

  const calculatedChecksum = (10 - (sum % 10)) % 10
  const providedChecksum = parseInt(idNumber.charAt(idNumber.length - 1), 10)

  return calculatedChecksum === providedChecksum
}

/**
 * Formats an SA ID number with spaces for readability
 * @param idNumber - The 13-digit SA ID number
 * @returns Formatted ID number: YYMMDD SSSS C A Z
 */
export function formatSAIDNumber(idNumber: string): string {
  const cleaned = idNumber.replace(/\s+/g, '').replace(/\D/g, '')

  if (cleaned.length !== 13) {
    return idNumber // Return original if invalid length
  }

  return `${cleaned.substring(0, 6)} ${cleaned.substring(6, 10)} ${cleaned.substring(10, 11)} ${cleaned.substring(11, 12)} ${cleaned.substring(12, 13)}`
}

/**
 * Extracts date of birth from SA ID number
 * @param idNumber - The 13-digit SA ID number
 * @returns Date of birth in YYYY-MM-DD format, or null if invalid
 */
export function getDateOfBirthFromSAID(idNumber: string): string | null {
  const result = validateSAIDNumber(idNumber)
  return result.isValid ? result.dateOfBirth || null : null
}

/**
 * Extracts gender from SA ID number
 * @param idNumber - The 13-digit SA ID number
 * @returns 'male', 'female', or null if invalid
 */
export function getGenderFromSAID(idNumber: string): 'male' | 'female' | null {
  const result = validateSAIDNumber(idNumber)
  return result.isValid ? result.gender || null : null
}

/**
 * Checks if a person is a minor (under 18) based on their SA ID number
 * @param idNumber - The 13-digit SA ID number
 * @returns boolean indicating if person is a minor, or null if invalid ID
 */
export function isMinorFromSAID(idNumber: string): boolean | null {
  const dob = getDateOfBirthFromSAID(idNumber)
  if (!dob) return null

  const birthDate = new Date(dob)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 < 18
  }

  return age < 18
}

/**
 * Calculates age from SA ID number
 * @param idNumber - The 13-digit SA ID number
 * @returns Age in years, or null if invalid ID
 */
export function getAgeFromSAID(idNumber: string): number | null {
  const dob = getDateOfBirthFromSAID(idNumber)
  if (!dob) return null

  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Example usage and test cases
 */
export const exampleSAIDNumbers = {
  valid: {
    male: '7505125123089', // Male, born 1975-05-12
    female: '7808154234092', // Female, born 1978-08-15
    young: '0603145345087', // Born 2006-03-14
  },
  invalid: {
    wrongLength: '123456789', // Too short
    invalidChecksum: '7505125123088', // Wrong checksum
    invalidDate: '7513455123089', // Invalid date
  },
}
