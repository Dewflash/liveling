from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.task import Task, TaskCategory
from app.repository.task_repo import TaskRepository
from app.services.reward_engine import RewardEngineService


class MockExternalIngestService:
    @staticmethod
    def _difficulty_from_duration(duration_mins: int) -> int:
        if duration_mins < 20:
            return 1
        if duration_mins < 45:
            return 2
        return 3

    @staticmethod
    def ingest_activity(session: Session, user_id: UUID, payload: dict) -> dict:
        activity = payload.get("activity")
        duration_mins = payload.get("duration_mins")

        if not activity or not isinstance(duration_mins, int):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payload must include 'activity' and integer 'duration_mins'",
            )

        task = Task(
            user_id=user_id,
            title=f"Auto-imported: {activity}",
            category=TaskCategory.HEALTH,
            difficulty=MockExternalIngestService._difficulty_from_duration(duration_mins),
        )
        task = TaskRepository.create_task(session, task)
        return RewardEngineService.process_task_completion(session, task.id)
