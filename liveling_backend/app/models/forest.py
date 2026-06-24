from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ForestSession(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    species_id: str = Field(max_length=80)
    species_name: str = Field(max_length=120)
    focus_minutes: int = Field(ge=1)
    reward_xp: int = Field(ge=0)
    reward_essence: int = Field(ge=0)
    design_id: str = Field(max_length=120)
    source: str = Field(default="forest", max_length=40)
    completed_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))


class ForestDesignUnlock(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    design_id: str = Field(max_length=120, index=True)
    cost_essence: int = Field(ge=0)
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
