from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.rpg_schema import (
    RPGCombatRequest,
    RPGCombatResponse,
    RPGEquipRequest,
    RPGEquipResponse,
    RPGHarvestRequest,
    RPGHarvestResponse,
    RPGItemResponse,
    RPGStateResponse,
    RPGTickRequest,
    RPGTickResponse,
)
from app.services.rpg_service import RPGService

router = APIRouter(prefix="/rpg", tags=["rpg"])


@router.get("/{user_id}/state", response_model=RPGStateResponse)
async def get_rpg_state(user_id: UUID, session: Session = Depends(get_session)):
    return RPGService.get_state(session, user_id)


@router.post("/harvest", response_model=RPGHarvestResponse)
async def harvest(payload: RPGHarvestRequest, session: Session = Depends(get_session)):
    state, credits_gained, shards_gained, wood_gained = RPGService.harvest_node(
        session=session,
        user_id=payload.user_id,
        node_type=payload.node_type,
        quantity=payload.quantity,
    )
    return {
        "state": state,
        "credits_gained": credits_gained,
        "shards_gained": shards_gained,
        "wood_gained": wood_gained,
    }


@router.post("/tick", response_model=RPGTickResponse)
async def tick(payload: RPGTickRequest, session: Session = Depends(get_session)):
    state, afk_minutes, credits_gained, shards_gained, wood_gained = RPGService.process_afk_tick(
        session=session,
        user_id=payload.user_id,
    )
    return {
        "state": state,
        "afk_minutes": afk_minutes,
        "credits_gained": credits_gained,
        "shards_gained": shards_gained,
        "wood_gained": wood_gained,
    }


@router.post("/combat", response_model=RPGCombatResponse)
async def combat(payload: RPGCombatRequest, session: Session = Depends(get_session)):
    state, tier, credits_gained, shards_gained, dropped_item = RPGService.defeat_enemy(
        session=session,
        user_id=payload.user_id,
        enemy_tier=payload.enemy_tier,
    )
    return {
        "state": state,
        "enemy_tier": tier,
        "credits_gained": credits_gained,
        "shards_gained": shards_gained,
        "dropped_item": dropped_item,
    }


@router.get("/{user_id}/inventory", response_model=list[RPGItemResponse])
async def get_inventory(user_id: UUID, session: Session = Depends(get_session)):
    return RPGService.list_inventory(session, user_id)


@router.post("/equip", response_model=RPGEquipResponse)
async def equip(payload: RPGEquipRequest, session: Session = Depends(get_session)):
    state, equipped_item = RPGService.equip_item(
        session=session,
        user_id=payload.user_id,
        item_id=payload.item_id,
    )
    return {
        "state": state,
        "equipped_item": equipped_item,
    }
