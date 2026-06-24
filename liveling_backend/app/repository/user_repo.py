from uuid import UUID

from sqlmodel import Session, select

from app.models.user import User


class UserRepository:
    @staticmethod
    def create_user(session: Session, username: str) -> User:
        user = User(username=username)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def get_user(session: Session, user_id: UUID) -> User | None:
        statement = select(User).where(User.id == user_id)
        return session.exec(statement).first()

    @staticmethod
    def get_user_by_username(session: Session, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        return session.exec(statement).first()

    @staticmethod
    def list_users(session: Session) -> list[User]:
        statement = select(User)
        return list(session.exec(statement).all())

    @staticmethod
    def update_user_balances(
        session: Session,
        user: User,
        xp_increment: int = 0,
        vitality_increment: int = 0,
        essence_increment: int = 0,
        credits_increment: int = 0,
        custom_wallet_increment: int = 0,
    ) -> User:
        user.total_xp = max(0, user.total_xp + xp_increment)
        user.vitality = max(0, user.vitality + vitality_increment)
        user.essence = max(0, user.essence + essence_increment)
        user.credits = max(0, user.credits + credits_increment)
        user.custom_wallet = max(0, user.custom_wallet + custom_wallet_increment)
        user.current_level = max(1, (user.total_xp // 1000) + 1)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    @staticmethod
    def save(session: Session, user: User) -> User:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
