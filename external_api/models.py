"""
Pydantic models for Testator Information API
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Literal
from datetime import datetime, date
from enum import Enum


# Enums for controlled vocabularies
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
    COMMON_LAW = "common_law"


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


class AssetType(str, Enum):
    REAL_ESTATE = "real_estate"
    BANK_ACCOUNT = "bank_account"
    INVESTMENT = "investment"
    VEHICLE = "vehicle"
    BUSINESS = "business"
    JEWELRY = "jewelry"
    ART = "art"
    CRYPTOCURRENCY = "cryptocurrency"
    OTHER = "other"


class DistributionType(str, Enum):
    PERCENTAGE = "percentage"
    SPECIFIC_AMOUNT = "specific_amount"
    SPECIFIC_ITEM = "specific_item"
    RESIDUAL = "residual"


# Base Models
class Address(BaseModel):
    """Physical address information"""
    street_address: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state_province: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(default="South Africa", max_length=100)


class PersonalInfo(BaseModel):
    """Testator's personal information"""
    full_name: str = Field(..., min_length=2, max_length=200)
    id_number: str = Field(..., min_length=1, max_length=50, description="National ID or passport number")
    date_of_birth: date
    gender: Gender
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    address: Address
    marital_status: MaritalStatus
    nationality: str = Field(default="South African", max_length=100)

    @field_validator("date_of_birth")
    @classmethod
    def validate_age(cls, v):
        """Ensure testator is at least 18 years old"""
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("Testator must be at least 18 years old")
        if age > 150:
            raise ValueError("Invalid date of birth")
        return v


class Beneficiary(BaseModel):
    """Beneficiary information"""
    full_name: str = Field(..., min_length=2, max_length=200)
    id_number: Optional[str] = Field(None, max_length=50)
    relationship: RelationshipType
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None
    date_of_birth: Optional[date] = None
    is_minor: bool = Field(default=False)
    guardian_name: Optional[str] = Field(None, max_length=200, description="Required if beneficiary is a minor")


class Distribution(BaseModel):
    """Asset distribution details"""
    beneficiary_name: str = Field(..., min_length=1, max_length=200)
    distribution_type: DistributionType
    percentage: Optional[float] = Field(None, ge=0, le=100, description="Percentage of estate (0-100)")
    specific_amount: Optional[float] = Field(None, ge=0, description="Specific monetary amount")
    asset_description: Optional[str] = Field(None, max_length=500, description="Description of specific asset")

    @field_validator("percentage")
    @classmethod
    def validate_percentage(cls, v, info):
        """Validate percentage is provided when distribution_type is PERCENTAGE"""
        if info.data.get("distribution_type") == DistributionType.PERCENTAGE and v is None:
            raise ValueError("Percentage must be provided for percentage-based distribution")
        return v


class Asset(BaseModel):
    """Asset information"""
    asset_type: AssetType
    description: str = Field(..., min_length=1, max_length=500)
    estimated_value: Optional[float] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=200)
    account_number: Optional[str] = Field(None, max_length=100, description="For bank accounts, etc.")
    ownership_percentage: float = Field(default=100, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=1000)


class Executor(BaseModel):
    """Executor/Administrator information"""
    full_name: str = Field(..., min_length=2, max_length=200)
    id_number: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    address: Address
    relationship: Optional[str] = Field(None, max_length=100)
    is_alternate: bool = Field(default=False, description="True if this is an alternate/backup executor")


class Guardian(BaseModel):
    """Guardian appointment for minor children"""
    full_name: str = Field(..., min_length=2, max_length=200)
    id_number: str = Field(..., min_length=1, max_length=50)
    relationship: str = Field(..., max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    address: Address
    is_alternate: bool = Field(default=False)


class SpecialProvision(BaseModel):
    """Special provisions or wishes"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: Optional[str] = Field(None, max_length=100, description="e.g., 'burial wishes', 'charitable giving'")


class TestatorInfo(BaseModel):
    """Complete testator information for will creation"""
    personal_info: PersonalInfo
    beneficiaries: List[Beneficiary] = Field(..., min_length=1)
    distributions: List[Distribution] = Field(..., min_length=1)
    assets: Optional[List[Asset]] = Field(default=None)
    executors: List[Executor] = Field(..., min_length=1, max_length=3)
    guardians: Optional[List[Guardian]] = Field(default=None)
    special_provisions: Optional[List[SpecialProvision]] = Field(default=None)
    funeral_wishes: Optional[str] = Field(None, max_length=2000)
    additional_notes: Optional[str] = Field(None, max_length=5000)

    @field_validator("distributions")
    @classmethod
    def validate_distributions_total(cls, v):
        """Ensure percentage-based distributions don't exceed 100%"""
        total_percentage = sum(
            d.percentage for d in v
            if d.distribution_type == DistributionType.PERCENTAGE and d.percentage is not None
        )
        if total_percentage > 100:
            raise ValueError(f"Total distribution percentage ({total_percentage}%) exceeds 100%")
        return v

    @field_validator("beneficiaries")
    @classmethod
    def validate_minor_guardians(cls, v):
        """Ensure minors have guardians specified"""
        for beneficiary in v:
            if beneficiary.is_minor and not beneficiary.guardian_name:
                raise ValueError(f"Guardian must be specified for minor beneficiary: {beneficiary.full_name}")
        return v


# Response Models
class TestatorResponse(BaseModel):
    """Response after successful testator submission"""
    success: bool
    testator_id: str
    message: str
    timestamp: datetime


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    service: str


class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    timestamp: datetime
    error_code: Optional[str] = None
