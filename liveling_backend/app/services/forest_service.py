from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.forest import ForestDesignUnlock, ForestSession
from app.repository.forest_repo import ForestRepository
from app.repository.user_repo import UserRepository


class ForestService:
    @staticmethod
    def _get_user_or_404(session: Session, user_id: UUID):
        user = UserRepository.get_user(session, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def _calculate_rewards(focus_minutes: int) -> tuple[int, int]:
        reward_xp = max(20, focus_minutes * 2)
        reward_essence = max(5, round(focus_minutes / 3))
        return reward_xp, reward_essence

    @staticmethod
    def complete_session(
        session: Session,
        user_id: UUID,
        species_id: str,
        species_name: str,
        focus_minutes: int,
        design_id: str,
    ) -> ForestSession:
        user = ForestService._get_user_or_404(session, user_id)
        reward_xp, reward_essence = ForestService._calculate_rewards(focus_minutes)

        UserRepository.update_user_balances(
            session=session,
            user=user,
            xp_increment=reward_xp,
            essence_increment=reward_essence,
        )

        forest_session = ForestSession(
            user_id=user_id,
            species_id=species_id,
            species_name=species_name,
            focus_minutes=focus_minutes,
            reward_xp=reward_xp,
            reward_essence=reward_essence,
            design_id=design_id,
            source="forest",
        )
        return ForestRepository.create_session(session, forest_session)

    @staticmethod
    def unlock_design(session: Session, user_id: UUID, design_id: str, cost_essence: int) -> ForestDesignUnlock:
        user = ForestService._get_user_or_404(session, user_id)

        existing = ForestRepository.get_design_unlock(session, user_id=user_id, design_id=design_id)
        if existing is not None:
            return existing

        if user.essence < cost_essence:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough Tree Essence")

        UserRepository.update_user_balances(
            session=session,
            user=user,
            essence_increment=-cost_essence,
        )

        unlock = ForestDesignUnlock(
            user_id=user_id,
            design_id=design_id,
            cost_essence=cost_essence,
        )
        return ForestRepository.create_design_unlock(session, unlock)

    @staticmethod
    def get_state(session: Session, user_id: UUID) -> tuple[list[str], list[ForestSession]]:
        ForestService._get_user_or_404(session, user_id)
        unlocks = ForestRepository.list_design_unlocks_by_user(session, user_id)
        sessions = ForestRepository.list_sessions_by_user(session, user_id)
        unlocked_ids = [unlock.design_id for unlock in unlocks]
        if "oak-original" not in unlocked_ids:
            unlocked_ids.append("oak-original")
        return unlocked_ids, sessions
