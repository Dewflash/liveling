from uuid import UUID

from sqlmodel import Session, select

from app.models.rpg_item import RPGItem


class RPGItemRepository:
    @staticmethod
    def list_items_by_user(session: Session, user_id: UUID) -> list[RPGItem]:
        statement = (
            select(RPGItem)
            .where(RPGItem.user_id == user_id)
            .order_by(RPGItem.created_at.desc())
        )
        return list(session.exec(statement).all())

    @staticmethod
    def get_item(session: Session, item_id: UUID) -> RPGItem | None:
        statement = select(RPGItem).where(RPGItem.id == item_id)
        return session.exec(statement).first()

    @staticmethod
    def create_item(session: Session, item: RPGItem) -> RPGItem:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item

    @staticmethod
    def clear_equipped_slot(session: Session, user_id: UUID, slot: str) -> None:
        statement = select(RPGItem).where(
            RPGItem.user_id == user_id,
            RPGItem.slot == slot,
            RPGItem.is_equipped == True,
        )
        items = list(session.exec(statement).all())
        for item in items:
            item.is_equipped = False
            session.add(item)
        session.commit()

    @staticmethod
    def save(session: Session, item: RPGItem) -> RPGItem:
        session.add(item)
        session.commit()
        session.refresh(item)
        return item
