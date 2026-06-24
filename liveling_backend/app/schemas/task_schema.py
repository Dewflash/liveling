from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskCategory


class TaskCreate(BaseModel):
    user_id: UUID
    title: str = Field(min_length=1, max_length=200)
    category: TaskCategory
    custom_category: Optional[str] = Field(default=None, max_length=80)
    difficulty: int = Field(ge=1, le=3)


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    category: TaskCategory
    custom_category: Optional[str]
    difficulty: int
    is_completed: bool
    created_at: datetime
    completed_at: Optional[datetime]


class TaskCompletionResponse(BaseModel):
    task_id: str
    user_id: str
    reward_xp: int
    applied_multiplier: float
    synergy_activated: bool
    new_level: int
