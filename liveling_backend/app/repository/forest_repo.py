from uuid import UUID

from sqlmodel import Session, select

from app.models.forest import ForestDesignUnlock, ForestSession


class ForestRepository:
    @staticmethod
    def create_session(session: Session, forest_session: ForestSession) -> ForestSession:
        session.add(forest_session)
        session.commit()
        session.refresh(forest_session)
        return forest_session

    @staticmethod
    def list_sessions_by_user(session: Session, user_id: UUID, limit: int = 50) -> list[ForestSession]:
        statement = (
            select(ForestSession)
            .where(ForestSession.user_id == user_id)
            .order_by(ForestSession.completed_at.desc())
            .limit(limit)
        )
        return list(session.exec(statement).all())

    @staticmethod
    def get_design_unlock(session: Session, user_id: UUID, design_id: str) -> ForestDesignUnlock | None:
        statement = select(ForestDesignUnlock).where(
            ForestDesignUnlock.user_id == user_id,
            ForestDesignUnlock.design_id == design_id,
        )
        return session.exec(statement).first()

    @staticmethod
    def list_design_unlocks_by_user(session: Session, user_id: UUID) -> list[ForestDesignUnlock]:
        statement = (
            select(ForestDesignUnlock)
            .where(ForestDesignUnlock.user_id == user_id)
            .order_by(ForestDesignUnlock.unlocked_at.desc())
        )
        return list(session.exec(statement).all())

    @staticmethod
    def create_design_unlock(session: Session, unlock: ForestDesignUnlock) -> ForestDesignUnlock:
        session.add(unlock)
        session.commit()
        session.refresh(unlock)
        return unlock
