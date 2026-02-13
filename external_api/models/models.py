"""
Pydantic models for Will Content API
Aligned with TypeScript WillContent interface
"""

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List, Literal
from datetime import datetime, date
from enum import Enum


# ============================================
# ENUMS
# ============================================

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"
    SEPARATED = "separated"


class MaritalRegime(str, Enum):
    """South African marital regimes"""
    ICOP = "ICOP"  # In Community of Property
    OCOP = "OCOP"  # Out of Community of Property
    OCOP_A = "OCOP-A"  # Out of Community of Property with Accrual
    OCOP_NA = "OCOP-NA"  # Out of Community of Property without Accrual


class WillType(str, Enum):
    INDIVIDUAL = "individual"
    MUTUAL = "mutual"
    JOINT = "joint"


class AssetType(str, Enum):
    REAL_ESTATE = "real-estate"
    VEHICLE = "vehicle"
    BANK_ACCOUNT = "bank-account"
    INVESTMENT = "investment"
    INSURANCE = "insurance"
    BUSINESS = "business"
    PERSONAL_PROPERTY = "personal-property"
    DIGITAL_ASSET = "digital-asset"
    OTHER = "other"


class RelationshipType(str, Enum):
    SPOUSE = "spouse"
    CHILD = "child"
    PARENT = "parent"
    SIBLING = "sibling"
    GRANDCHILD = "grandchild"
    GRANDPARENT = "grandparent"
    NIECE_NEPHEW = "niece_nephew"
    COUSIN = "cousin"
    FRIEND = "friend"
    CHARITY = "charity"
    OTHER = "other"


class LiabilityType(str, Enum):
    MORTGAGE = "mortgage"
    LOAN = "loan"
    CREDIT_CARD = "credit-card"
    TAX = "tax"
    NORMAL = "normal"
    COUNTER_CLAIM = "counter claim"
    MASTER_FEE = "master's fee"
    EXECUTOR_FEE = "executor's fee"
    ESTATE_DUTY = "estate duty"
    CAPITAL_GAINS_TAX = "capital's gains tax"
    OTHER = "other"


class FuneralPreference(str, Enum):
    BURIAL = "burial"
    CREMATION = "cremation"
    DONATION = "donation"
    OTHER = "other"


class DigitalAssetType(str, Enum):
    SOCIAL_MEDIA = "social-media"
    EMAIL = "email"
    CLOUD_STORAGE = "cloud-storage"
    CRYPTOCURRENCY = "cryptocurrency"
    DOMAIN = "domain"
    OTHER = "other"


class MinorProvisionMethod(str, Enum):
    GUARDIAN_FUND = "guardian-fund"
    TESTAMENTARY_TRUST = "testamentary-trust"
    OTHER = "other"


class ChildRelationship(str, Enum):
    BIOLOGICAL = "biological"
    ADOPTED = "adopted"
    STEPCHILD = "stepchild"
    OTHER = "other"


class UsufructTerminationType(str, Enum):
    DEATH = "death"


# ============================================
# BASE MODELS
# ============================================

class Address(BaseModel):
    """Physical address information"""
    street: str = Field(..., min_length=1, max_length=200, description="Street address")
    city: str = Field(..., min_length=1, max_length=100, description="City")
    state: str = Field(..., min_length=1, max_length=100, description="Province/State")
    postalCode: str = Field(..., min_length=1, max_length=20, alias="postal_code", description="Postal code")
    country: str = Field(default="South Africa", max_length=100, description="Country")

    class Config:
        populate_by_name = True


# ============================================
# NESTED MODELS
# ============================================

class UsufructConfig(BaseModel):
    """Usufruct configuration for assets"""
    usufructuaryId: str = Field(..., description="Beneficiary with right to use/enjoy")
    bareDominiumOwnerId: str = Field(..., description="Beneficiary with bare ownership")
    terminationType: UsufructTerminationType = Field(default=UsufructTerminationType.DEATH)


class BeneficiaryAllocation(BaseModel):
    """Asset-specific beneficiary allocation"""
    beneficiaryId: str = Field(..., description="Beneficiary ID")
    percentage: float = Field(..., ge=0, le=100, description="Allocation percentage (0-100)")

    @field_validator("percentage")
    @classmethod
    def validate_percentage(cls, v):
        """Ensure percentage is valid"""
        if v < 0 or v > 100:
            raise ValueError("Percentage must be between 0 and 100")
        return v


class FuneralWishes(BaseModel):
    """Funeral wishes information"""
    preference: FuneralPreference
    location: Optional[str] = Field(None, max_length=200)
    specificInstructions: Optional[str] = Field(None, max_length=2000)
    prePaid: Optional[bool] = Field(None)
    funeralHome: Optional[str] = Field(None, max_length=200)
    religiousPreferences: Optional[str] = Field(None, max_length=500)


# ============================================
# PRIMARY MODELS
# ============================================

class TestatorInfo(BaseModel):
    """Testator personal information"""
    # id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    #fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    firstName: Optional[str] = Field(None, max_length=100, description="First name")
    lastName: Optional[str] = Field(None, max_length=100, description="Last name")
    dateOfBirth: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    idNumber: str = Field(..., min_length=1, max_length=50, description="National ID or passport number")
    address: Optional[Address] = Field(None, description="Address")
    phone: Optional[str] = Field(None, min_length=10, max_length=20, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")
    occupation: Optional[str] = Field(None, max_length=200, description="Occupation")

    @field_validator("dateOfBirth")
    @classmethod
    def validate_date_of_birth(cls, v):
        """Ensure testator is at least 18 years old"""
        try:
            dob = date.fromisoformat(v)
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 18:
                raise ValueError("Testator must be at least 18 years old")
            if age > 150:
                raise ValueError("Invalid date of birth")
            return v
        except ValueError as e:
            if "Invalid date of birth" in str(e) or "Testator must be at least 18" in str(e):
                raise e
            raise ValueError(f"Invalid date format. Use YYYY-MM-DD format: {str(e)}")


class SpouseInfo(BaseModel):
    """Spouse information for marriage details"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    #fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    firstName: Optional[str] = Field(None, max_length=100, description="First name")
    lastName: Optional[str] = Field(None, max_length=100, description="Last name")
    idNumber: Optional[str] = Field(None, max_length=50, description="National ID number")
    dateOfBirth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    dateOfMarriage: Optional[str] = Field(None, description="Date of marriage (YYYY-MM-DD)")
    maritalRegime: MaritalRegime = Field(..., description="Marital regime")


class MarriageInfo(BaseModel):
    """Marriage status and spouse details"""
    status: MaritalStatus
    spouses: Optional[List[SpouseInfo]] = Field(None, description="List of spouses (for polygamous marriages)")


class Child(BaseModel):
    """Child information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    #fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    firstName: Optional[str] = Field(None, max_length=100, description="First name")
    lastName: Optional[str] = Field(None, max_length=100, description="Last name")
    idNumber: Optional[str] = Field(None, max_length=50, description="National ID number (if 16+)")
    dateOfBirth: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    isMinor: bool = Field(..., description="Whether child is under 18")
    parentSpouseId: Optional[str] = Field(None, description="ID of parent spouse")
    relationshipToTestator: ChildRelationship = Field(..., description="Relationship to testator")


class Witness(BaseModel):
    """Witness information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    idNumber: Optional[str] = Field(None, max_length=50, description="National ID number")
    address: Address
    phone: Optional[str] = Field(None, max_length=20)
    occupation: Optional[str] = Field(None, max_length=200)
    dateWitnessed: Optional[str] = Field(None, description="Date will was witnessed (YYYY-MM-DD)")


class Liability(BaseModel):
    """Debt/liability information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    type: LiabilityType
    creditor: str = Field(..., min_length=1, max_length=200, description="Creditor name")
    amount: float = Field(..., ge=0, description="Liability amount")
    currency: str = Field(default="ZAR", max_length=3, description="Currency code (ISO 4217)")
    accountNumber: Optional[str] = Field(None, max_length=100, description="Account number")
    notes: Optional[str] = Field(None, max_length=1000)
    beneficiaryId: Optional[str] = Field(..., min_length=1, max_length=100, description="Beneficary ID")
    assetId: Optional[str] = Field(..., min_length=1, max_length=100, description="Asset ID")


class DigitalAsset(BaseModel):
    """Digital asset instructions"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    type: DigitalAssetType
    platform: str = Field(..., min_length=1, max_length=200, description="Platform name")
    username: Optional[str] = Field(None, max_length=200)
    instructions: str = Field(..., min_length=1, max_length=2000, description="Instructions for handling")
    beneficiaryId: Optional[str] = Field(None, description="Beneficiary ID")


class SpecificBequest(BaseModel):
    """Specific item bequest"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    description: str = Field(..., min_length=1, max_length=500, description="Item description")
    beneficiaryId: str = Field(..., description="Primary beneficiary ID")
    substituteBeneficiaryId: Optional[str] = Field(None, description="Substitute beneficiary ID")


class MinorBeneficiaryProvisions(BaseModel):
    """Instructions for minor beneficiaries"""
    method: MinorProvisionMethod = Field(..., description="Method for handling minor's inheritance")
    ageOfInheritance: Optional[int] = Field(18, ge=18, le=35, description="Age at which minor inherits")
    trusteeId: Optional[str] = Field(None, description="Trustee ID if using testamentary trust")
    instructions: Optional[str] = Field(None, max_length=2000)


class Trustee(BaseModel):
    """Trustee for managing minor beneficiaries' inheritance"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    idNumber: str = Field(..., min_length=1, max_length=50, description="National ID number")
    relationship: str = Field(..., max_length=100, description="Relationship to testator")
    address: Address
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    forBeneficiaries: List[str] = Field(..., description="IDs of minor beneficiaries")
    isAlternate: Optional[bool] = Field(False)
    isGuardian: Optional[bool] = Field(False)
    guardianId: Optional[str] = Field(None, description="Guardian ID if trustee is guardian")


class Asset(BaseModel):
    """Asset information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    type: AssetType
    description: str = Field(..., min_length=1, max_length=500)
    location: Optional[str] = Field(None, max_length=200)
    estimatedValue: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field("ZAR", max_length=3, description="Currency code (ISO 4217)")
    accountNumber: Optional[str] = Field(None, max_length=100, description="Account number")
    notes: Optional[str] = Field(None, max_length=1000)
    beneficiaryAllocations: Optional[List[BeneficiaryAllocation]] = Field(
        None, description="Asset-specific beneficiary allocations"
    )
    usufruct: Optional[UsufructConfig] = Field(None, description="Usufruct configuration")

    @field_validator("beneficiaryAllocations")
    @classmethod
    def validate_allocations(cls, v):
        """Ensure allocations sum to 100% if present"""
        if v:
            total = sum(allocation.percentage for allocation in v)
            if abs(total - 100) > 0.01:  # Allow for floating point precision
                raise ValueError(f"Beneficiary allocations must sum to 100%, got {total}%")
        return v


class Beneficiary(BaseModel):
    """Beneficiary information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    #fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    firstName: Optional[str] = Field(None, max_length=100, description="First name")
    lastName: Optional[str] = Field(None, max_length=100, description="Last name")
    idNumber: Optional[str] = Field(None, max_length=50, description="National ID number")
    relationship: str = Field(..., max_length=100, description="Relationship to testator")
    dateOfBirth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    address: Optional[Address] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    allocationPercentage: Optional[float] = Field(None, ge=0, le=100, description="Estate allocation percentage")
    specificBequests: Optional[List[str]] = Field(None, description="List of specific bequest IDs")
    isMinor: Optional[bool] = Field(False)
    guardianId: Optional[str] = Field(None, description="Guardian ID if minor")
    substituteBeneficiaryId: Optional[str] = Field(None, description="Substitute beneficiary ID")


class Executor(BaseModel):
    """Executor/Administrator information"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    idNumber: str = Field(..., min_length=1, max_length=50, description="National ID number")
    relationship: str = Field(..., max_length=100, description="Relationship to testator")
    address: Address
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    isAlternate: Optional[bool] = Field(False, description="Alternate/backup executor")
    isSurvivingSpouse: Optional[bool] = Field(False, description="Surviving spouse in mutual/joint wills")


class Guardian(BaseModel):
    """Guardian appointment for minor children"""
    id: str = Field(..., min_length=1, max_length=100, description="Unique identifier")
    fullName: str = Field(..., min_length=2, max_length=200, description="Full name")
    idNumber: str = Field(..., min_length=1, max_length=50, description="National ID number")
    relationship: str = Field(..., max_length=100, description="Relationship to testator")
    address: Address
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[EmailStr] = None
    forChildren: List[str] = Field(..., description="IDs of children under guardianship")
    isAlternate: Optional[bool] = Field(False)

class User(BaseModel):
    """Will builder user"""
    

# ============================================
# ROOT MODEL
# ============================================

class WillContent(BaseModel):
    """Complete will content structure"""
    # user_id: str = Optional[Field(..., min_length=1, max_length=50, description="will builder user id")]
    #user_email: EmailStr = Field(..., description="Will builder user email (required)")
    willType: Optional[WillType] = Field(None, description="Type of will")
    testator: TestatorInfo = Field(..., description="Testator information")
    # maritalStatus: MaritalStatus = Field(..., description="Marital status")
    marriage: MarriageInfo = Field(..., description="Marriage information")
    children: Optional[List[Child]] = Field(None, description="Children")
    assets: Optional[List[Asset]] = Field(None, description="Assets")
    beneficiaries: Optional[List[Beneficiary]] = Field(default_factory=list, description="Beneficiaries")
    executors: Optional[List[Executor]] = Field(default_factory=list, description="Executors (minimum 1)")
    witnesses: Optional[List[Witness]] = Field(default_factory=list, description="Witnesses (minimum 2 for SA)")
    guardians: Optional[List[Guardian]] = Field(default_factory=list, description="Guardians for minor children")
    trustees: Optional[List[Trustee]] = Field(default_factory=list, description="Trustees for minor beneficiaries")
    liabilities: Optional[List[Liability]] = Field(default_factory=list, description="Liabilities")
    funeralWishes: Optional[FuneralWishes] = Field(None, description="Funeral wishes")
    digitalAssets: Optional[List[DigitalAsset]] = Field(None, description="Digital assets")
    specialInstructions: Optional[str] = Field(None, max_length=5000, description="Special instructions")
    revocationClause: Optional[str] = Field(None, min_length=10, description="Required revocation clause")
    residuaryClause: Optional[str] = Field(None, min_length=10, description="Required residuary clause")
    specificBequests: Optional[List[SpecificBequest]] = Field(default_factory=list, description="Specific bequests")
    minorBeneficiaryProvisions: Optional[MinorBeneficiaryProvisions] = Field(
        None, description="Provisions for minor beneficiaries"
    )
    attestationClause: Optional[str] = Field(None, max_length=2000, description="Attestation clause")
    dateExecuted: Optional[str] = Field(None, description="Execution date (YYYY-MM-DD)")
    placeExecuted: Optional[str] = Field(None, max_length=200, description="Execution place")

    @model_validator(mode='after')
    def validate_will_content(self):
        """Cross-model validations"""
        errors = []

        # # Validate beneficiary allocations don't exceed 100%
        # total_allocation = sum(
        #     b.allocationPercentage for b in self.beneficiaries if self.beneficiaries is not None
        #     if b.allocationPercentage is not None
        # )
        # if total_allocation > 100:
        #     errors.append(f"Total beneficiary allocations ({total_allocation}%) exceed 100%")

        # # Validate minor beneficiaries have guardians
        # for beneficiary in self.beneficiaries:
        #     if beneficiary.isMinor and not beneficiary.guardianId:
        #         errors.append(f"Minor beneficiary '{beneficiary.fullName}' must have a guardianId")

        # # Validate guardian IDs exist
        # guardian_ids = {g.id for g in self.guardians}
        # for beneficiary in self.beneficiaries:
        #     if beneficiary.guardianId and beneficiary.guardianId not in guardian_ids:
        #         errors.append(
        #             f"Guardian ID '{beneficiary.guardianId}' for beneficiary '{beneficiary.fullName}' not found"
        #         )

        # Validate beneficiary IDs exist for references
        beneficiary_ids = {b.id for b in self.beneficiaries if self.beneficiaries is not None}

        # # Check digital assets
        # for asset in self.digitalAssets:
        #     if asset.beneficiaryId and asset.beneficiaryId not in beneficiary_ids:
        #         errors.append(f"Beneficiary ID '{asset.beneficiaryId}' in digital asset '{asset.id}' not found")

        # # Check specific bequests
        # if self.specificBequests:
        #     for bequest in self.specificBequests:
        #         if bequest.beneficiaryId not in beneficiary_ids:
        #             errors.append(
        #                 f"Beneficiary ID '{bequest.beneficiaryId}' in bequest '{bequest.id}' not found"
        #             )
        #         if bequest.substituteBeneficiaryId and bequest.substituteBeneficiaryId not in beneficiary_ids:
        #             errors.append(
        #                 f"Substitute beneficiary ID '{bequest.substituteBeneficiaryId}' in bequest '{bequest.id}' not found"
        #             )

        # # Check substitute beneficiaries
        # for beneficiary in self.beneficiaries:
        #     if beneficiary.substituteBeneficiaryId and beneficiary.substituteBeneficiaryId not in beneficiary_ids:
        #         errors.append(
        #             f"Substitute beneficiary ID '{beneficiary.substituteBeneficiaryId}' for '{beneficiary.fullName}' not found"
        #         )

        # Validate witnesses are not beneficiaries, executors, or guardians
        witness_ids = {w.idNumber for w in self.witnesses if w.idNumber}
        beneficiary_id_numbers = {b.idNumber for b in self.beneficiaries if b.idNumber}
        executor_id_numbers = {e.idNumber for e in self.executors}
        guardian_id_numbers = {g.idNumber for g in self.guardians}

        conflicting_ids = witness_ids & (beneficiary_id_numbers | executor_id_numbers | guardian_id_numbers)
        if conflicting_ids:
            errors.append(
                f"Witnesses cannot be beneficiaries, executors, or guardians. Conflicting IDs: {conflicting_ids}"
            )

        # # Validate minimum witnesses
        # if len(self.witnesses) < 2:
        #     errors.append("Minimum 2 witnesses required for South African wills")

        # # Validate trustee IDs if minor provisions use testamentary trust
        # if self.minorBeneficiaryProvisions and self.minorBeneficiaryProvisions.method == MinorProvisionMethod.TESTAMENTARY_TRUST:
        #     if not self.minorBeneficiaryProvisions.trusteeId:
        #         errors.append("Trustee ID required when using testamentary trust for minor provisions")
        #     elif self.trustees:
        #         trustee_ids = {t.id for t in self.trustees}
        #         if self.minorBeneficiaryProvisions.trusteeId not in trustee_ids:
        #             errors.append(
        #                 f"Trustee ID '{self.minorBeneficiaryProvisions.trusteeId}' in minor provisions not found"
        #             )

        if errors:
            raise ValueError("; ".join(errors))

        return self


# ============================================
# RESPONSE MODELS
# ============================================

class WillContentResponse(BaseModel):
    """Response after successful will content submission"""
    success: bool
    will_id: str
    message: str
    timestamp: datetime


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    service: str
    db: Optional[str] = Field(None, description="Database connection status")


class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    timestamp: datetime
    error_code: Optional[str] = None
