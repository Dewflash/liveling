from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    username: str = Field(index=True, unique=True, max_length=50)
    total_xp: int = Field(default=0, ge=0)
    vitality: int = Field(default=0, ge=0)
    essence: int = Field(default=0, ge=0)
    credits: int = Field(default=0, ge=0)
    custom_wallet: int = Field(default=0, ge=0)
    current_level: int = Field(default=1, ge=1)
    next_reward_multiplier: float = Field(default=1.0, ge=1.0)
