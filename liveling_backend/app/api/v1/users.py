from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.user_schema import UserCreate, UserProfileResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserProfileResponse)
async def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    return UserService.create_user(session, payload)


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
async def get_profile(user_id: UUID, session: Session = Depends(get_session)):
    return UserService.get_profile(session, user_id)


@router.get("/by-username/{username}/profile", response_model=UserProfileResponse)
async def get_profile_by_username(username: str, session: Session = Depends(get_session)):
    return UserService.get_profile_by_username(session, username)
