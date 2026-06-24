from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.task import TaskCategory
from app.repository.task_repo import TaskRepository
from app.repository.user_repo import UserRepository
from app.services.game_mechanics import GameMechanicsService


class RewardEngineService:
    BASE_XP = 50

    @staticmethod
    def process_task_completion(session: Session, task_id: UUID) -> dict[str, int | float | str | bool]:
        task = TaskRepository.get_task(session, task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        if task.is_completed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Task already completed",
            )

        user = UserRepository.get_user(session, task.user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        TaskRepository.mark_task_complete(session, task)

        multiplier = user.next_reward_multiplier
        reward = int(RewardEngineService.BASE_XP * task.difficulty * multiplier)
        user.next_reward_multiplier = 1.0

        vitality = essence = credits = custom_wallet = 0
        if task.category == TaskCategory.HEALTH:
            vitality = reward
        elif task.category == TaskCategory.SOCIAL:
            essence = reward
        elif task.category == TaskCategory.WORK:
            credits = reward
        else:
            custom_wallet = reward

        user = UserRepository.update_user_balances(
            session=session,
            user=user,
            xp_increment=reward,
            vitality_increment=vitality,
            essence_increment=essence,
            credits_increment=credits,
            custom_wallet_increment=custom_wallet,
        )

        synergy_activated = GameMechanicsService.calculate_synergy_bonus(session, user.id)

        return {
            "task_id": str(task.id),
            "user_id": str(user.id),
            "reward_xp": reward,
            "applied_multiplier": multiplier,
            "synergy_activated": synergy_activated,
            "new_level": user.current_level,
        }
