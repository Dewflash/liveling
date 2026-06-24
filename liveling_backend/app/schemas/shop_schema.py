from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class ShopItemType(str, Enum):
    BUY_TREE_ESSENCE = "BUY_TREE_ESSENCE"
    BUY_SWORD_STATS = "BUY_SWORD_STATS"
    BUY_STAR_POINTS = "BUY_STAR_POINTS"


class ShopBuyRequest(BaseModel):
    user_id: UUID
    item_type: ShopItemType
    amount: int = Field(default=1, ge=1)


class ShopBuyResponse(BaseModel):
    status: str
    item: str
    cost: int
    amount_purchased: int
