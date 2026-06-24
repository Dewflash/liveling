from uuid import UUID

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.task_schema import TaskCompletionResponse, TaskCreate, TaskResponse
from app.services.reward_engine import RewardEngineService
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse)
async def create_task(payload: TaskCreate, session: Session = Depends(get_session)):
    return TaskService.create_task(session, payload)


@router.get("/user/{user_id}", response_model=list[TaskResponse])
async def list_tasks_by_user(user_id: UUID, session: Session = Depends(get_session)):
    return TaskService.get_tasks_by_user(session, user_id)


@router.post("/{task_id}/complete", response_model=TaskCompletionResponse)
async def complete_task(task_id: UUID, session: Session = Depends(get_session)) -> dict:
    return RewardEngineService.process_task_completion(session, task_id)
