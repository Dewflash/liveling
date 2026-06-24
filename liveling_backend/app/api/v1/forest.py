from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.forest_schema import (
    ForestDesignUnlockRequest,
    ForestDesignUnlockResponse,
    ForestSessionCompleteRequest,
    ForestSessionResponse,
    ForestStateResponse,
)
from app.services.forest_service import ForestService

router = APIRouter(prefix="/forest", tags=["forest"])


@router.get("/{user_id}/state", response_model=ForestStateResponse)
async def get_forest_state(user_id: UUID, session: Session = Depends(get_session)):
    unlocked_ids, sessions = ForestService.get_state(session, user_id)
    return {
        "unlocked_design_ids": unlocked_ids,
        "sessions": sessions,
    }


@router.post("/session/complete", response_model=ForestSessionResponse)
async def complete_forest_session(payload: ForestSessionCompleteRequest, session: Session = Depends(get_session)):
    return ForestService.complete_session(
        session=session,
        user_id=payload.user_id,
        species_id=payload.species_id,
        species_name=payload.species_name,
        focus_minutes=payload.focus_minutes,
        design_id=payload.design_id,
    )


@router.post("/designs/unlock", response_model=ForestDesignUnlockResponse)
async def unlock_forest_design(payload: ForestDesignUnlockRequest, session: Session = Depends(get_session)):
    return ForestService.unlock_design(
        session=session,
        user_id=payload.user_id,
        design_id=payload.design_id,
        cost_essence=payload.cost_essence,
    )
