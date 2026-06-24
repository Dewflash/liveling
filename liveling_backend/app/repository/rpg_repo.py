from datetime import datetime
from uuid import UUID

from sqlmodel import Session, select

from app.models.rpg import RPGState


class RPGRepository:
    @staticmethod
    def get_state_by_user(session: Session, user_id: UUID) -> RPGState | None:
        statement = select(RPGState).where(RPGState.user_id == user_id)
        return session.exec(statement).first()

    @staticmethod
    def create_state(session: Session, user_id: UUID) -> RPGState:
        state = RPGState(user_id=user_id)
        session.add(state)
        session.commit()
        session.refresh(state)
        return state

    @staticmethod
    def save(session: Session, state: RPGState) -> RPGState:
        session.add(state)
        session.commit()
        session.refresh(state)
        return state

    @staticmethod
    def apply_resource_delta(
        session: Session,
        state: RPGState,
        wood_delta: int = 0,
        ore_delta: int = 0,
        shards_delta: int = 0,
        trees_delta: int = 0,
        last_active_at: datetime | None = None,
    ) -> RPGState:
        state.wood = max(0, state.wood + wood_delta)
        state.iron_ore = max(0, state.iron_ore + ore_delta)
        state.relic_shards = max(0, state.relic_shards + shards_delta)
        state.trees_chopped = max(0, state.trees_chopped + trees_delta)
        if last_active_at is not None:
            state.last_active_at = last_active_at
        return RPGRepository.save(session, state)
