from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ForestSessionCompleteRequest(BaseModel):
    user_id: UUID
    species_id: str = Field(min_length=1, max_length=80)
    species_name: str = Field(min_length=1, max_length=120)
    focus_minutes: int = Field(ge=1, le=180)
    design_id: str = Field(min_length=1, max_length=120)


class ForestSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    species_id: str
    species_name: str
    focus_minutes: int
    reward_xp: int
    reward_essence: int
    design_id: str
    source: str
    completed_at: datetime


class ForestDesignUnlockRequest(BaseModel):
    user_id: UUID
    design_id: str = Field(min_length=1, max_length=120)
    cost_essence: int = Field(ge=0)


class ForestDesignUnlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    design_id: str
    cost_essence: int
    unlocked_at: datetime


class ForestStateResponse(BaseModel):
    unlocked_design_ids: list[str]
    sessions: list[ForestSessionResponse]
