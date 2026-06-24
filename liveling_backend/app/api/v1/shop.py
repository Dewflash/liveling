from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.shop_schema import ShopBuyRequest, ShopBuyResponse, ShopItemType
from app.services.shop_service import ShopService

router = APIRouter(prefix="/shop", tags=["shop"])


@router.post("/buy", response_model=ShopBuyResponse)
async def buy_item(payload: ShopBuyRequest, session: Session = Depends(get_session)):
    if payload.item_type == ShopItemType.BUY_TREE_ESSENCE:
        return ShopService.buy_tree_essence(session, payload.user_id, payload.amount)

    if payload.item_type == ShopItemType.BUY_SWORD_STATS:
        return ShopService.buy_sword_stats(session, payload.user_id, payload.amount)

    if payload.item_type == ShopItemType.BUY_STAR_POINTS:
        return ShopService.buy_star_points(session, payload.user_id, payload.amount)

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported shop item")
