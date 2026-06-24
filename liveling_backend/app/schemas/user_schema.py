from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    total_xp: int
    vitality: int
    essence: int
    credits: int
    custom_wallet: int
    current_level: int


class UserVerificationResponse(BaseModel):
    current_level: int
    total_xp: int
