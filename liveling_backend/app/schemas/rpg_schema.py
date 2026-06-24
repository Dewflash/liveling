from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RPGStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    wood: int
    iron_ore: int
    relic_shards: int
    gear_score: int
    trees_chopped: int
    last_active_at: datetime


class RPGItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    item_name: str
    slot: str
    rarity: str
    affix: str
    power: int
    is_equipped: bool
    created_at: datetime


class RPGHarvestRequest(BaseModel):
    user_id: UUID
    node_type: str = Field(min_length=1, max_length=40)
    quantity: int = Field(default=1, ge=1, le=50)


class RPGTickRequest(BaseModel):
    user_id: UUID


class RPGCombatRequest(BaseModel):
    user_id: UUID
    enemy_tier: str = Field(default="normal", min_length=1, max_length=20)


class RPGHarvestResponse(BaseModel):
    state: RPGStateResponse
    credits_gained: int
    shards_gained: int
    wood_gained: int


class RPGTickResponse(BaseModel):
    state: RPGStateResponse
    afk_minutes: int
    credits_gained: int
    shards_gained: int
    wood_gained: int


class RPGCombatResponse(BaseModel):
    state: RPGStateResponse
    enemy_tier: str
    credits_gained: int
    shards_gained: int
    dropped_item: RPGItemResponse | None = None


class RPGEquipRequest(BaseModel):
    user_id: UUID
    item_id: UUID


class RPGEquipResponse(BaseModel):
    state: RPGStateResponse
    equipped_item: RPGItemResponse
