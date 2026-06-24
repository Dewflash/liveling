from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.repository.user_repo import UserRepository
from app.schemas.user_schema import UserCreate


class UserService:
    @staticmethod
    def create_user(session: Session, payload: UserCreate):
        existing = UserRepository.get_user_by_username(session, payload.username)
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
        return UserRepository.create_user(session, payload.username)

    @staticmethod
    def get_profile(session: Session, user_id: UUID):
        user = UserRepository.get_user(session, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def get_profile_by_username(session: Session, username: str):
        user = UserRepository.get_user_by_username(session, username)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user