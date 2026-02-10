"""
SQLAlchemy database models matching Prisma schema
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.sql import func
from database import Base
import enum


class WillStatus(str, enum.Enum):
    """Will status enumeration"""
    DRAFT = "DRAFT"
    FINAL = "FINAL"
    ARCHIVED = "ARCHIVED"


class User(Base):
    """User model matching Prisma schema"""
    __tablename__ = "User"

    id = Column(String, primary_key=True, index=True)
    clerkId = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    firstName = Column(String, nullable=True)
    lastName = Column(String, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False)

    # Create composite index for common queries
    __table_args__ = (
        Index('idx_user_clerk_email', 'clerkId', 'email'),
    )


class Will(Base):
    """Will model matching Prisma schema"""
    __tablename__ = "Will"

    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)  # JSON string
    editorContent = Column(Text, nullable=True)  # JSON string for editor state
    status = Column(SQLEnum(WillStatus), default=WillStatus.DRAFT, nullable=False, index=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now(), nullable=False)

    # Create composite index for common queries
    __table_args__ = (
        Index('idx_will_user_status', 'userId', 'status'),
    )
