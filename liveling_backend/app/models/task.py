from datetime import UTC, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class TaskCategory(str, Enum):
    HEALTH = "HEALTH"
    SOCIAL = "SOCIAL"
    WORK = "WORK"
    CUSTOM = "CUSTOM"


class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=200)
    category: TaskCategory = Field(default=TaskCategory.WORK)
    custom_category: Optional[str] = Field(default=None, max_length=80)
    difficulty: int = Field(default=1, ge=1, le=3)
    is_completed: bool = Field(default=False)
    completed_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
