from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class RPGItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    item_name: str = Field(max_length=120)
    slot: str = Field(max_length=30)
    rarity: str = Field(max_length=20)
    affix: str = Field(max_length=80)
    power: int = Field(default=1, ge=1)
    is_equipped: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
