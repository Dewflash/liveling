from uuid import UUID

from sqlmodel import Session, select

from app.models.journal import JournalEntry


class JournalRepository:
    @staticmethod
    def create_entry(session: Session, entry: JournalEntry) -> JournalEntry:
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return entry

    @staticmethod
    def get_entries_by_task(session: Session, task_id: UUID) -> list[JournalEntry]:
        statement = select(JournalEntry).where(JournalEntry.task_id == task_id)
        return list(session.exec(statement).all())
