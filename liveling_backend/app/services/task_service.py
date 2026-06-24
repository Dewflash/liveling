from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.task import Task
from app.repository.task_repo import TaskRepository
from app.repository.user_repo import UserRepository
from app.schemas.task_schema import TaskCreate


class TaskService:
    @staticmethod
    def create_task(session: Session, payload: TaskCreate) -> Task:
        user = UserRepository.get_user(session, payload.user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        task = Task(**payload.model_dump())
        return TaskRepository.create_task(session, task)

    @staticmethod
    def get_tasks_by_user(session: Session, user_id: UUID) -> list[Task]:
        return TaskRepository.get_tasks_by_user(session, user_id)