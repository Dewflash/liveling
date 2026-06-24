from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_session
from app.repository.user_repo import UserRepository
from app.schemas.user_schema import UserVerificationResponse
from app.services.integrations.mock_external_ingest import MockExternalIngestService

router = APIRouter(prefix="/external", tags=["external"])


@router.get("/users/{user_id}/verification", response_model=UserVerificationResponse)
async def verify_user_effort(user_id: UUID, session: Session = Depends(get_session)):
    user = UserRepository.get_user(session, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserVerificationResponse(current_level=user.current_level, total_xp=user.total_xp)


@router.post("/users/{user_id}/ingest")
async def ingest_external_activity(user_id: UUID, payload: dict, session: Session = Depends(get_session)):
    return MockExternalIngestService.ingest_activity(session, user_id, payload)
