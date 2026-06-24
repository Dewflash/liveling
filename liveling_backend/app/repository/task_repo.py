from datetime import UTC, datetime
from uuid import UUID

from sqlmodel import Session, select

from app.models.task import Task


class TaskRepository:
    @staticmethod
    def create_task(session: Session, task: Task) -> Task:
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_task(session: Session, task_id: UUID) -> Task | None:
        statement = select(Task).where(Task.id == task_id)
        return session.exec(statement).first()

    @staticmethod
    def mark_task_complete(session: Session, task: Task) -> Task:
        task.is_completed = True
        task.completed_at = datetime.now(UTC).replace(tzinfo=None)
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: UUID) -> list[Task]:
        statement = select(Task).where(Task.user_id == user_id)
        return list(session.exec(statement).all())

    @staticmethod
    def get_completed_tasks_between(
        session: Session,
        user_id: UUID,
        start_at: datetime,
        end_at: datetime,
    ) -> list[Task]:
        statement = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.is_completed.is_(True))
            .where(Task.completed_at >= start_at)
            .where(Task.completed_at <= end_at)
        )
        return list(session.exec(statement).all())
