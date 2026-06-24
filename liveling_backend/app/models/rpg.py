from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class RPGState(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True, unique=True)
    wood: int = Field(default=0, ge=0)
    iron_ore: int = Field(default=0, ge=0)
    relic_shards: int = Field(default=0, ge=0)
    gear_score: int = Field(default=1, ge=1)
    trees_chopped: int = Field(default=0, ge=0)
    last_active_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
