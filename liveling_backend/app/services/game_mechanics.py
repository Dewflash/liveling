from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlmodel import Session

from app.models.task import TaskCategory
from app.repository.task_repo import TaskRepository
from app.repository.user_repo import UserRepository


class GameMechanicsService:
    @staticmethod
    def calculate_synergy_bonus(session: Session, user_id: UUID) -> bool:
        now = datetime.now(timezone.utc)
        start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

        completed_today = TaskRepository.get_completed_tasks_between(
            session=session,
            user_id=user_id,
            start_at=start.replace(tzinfo=None),
            end_at=now.replace(tzinfo=None),
        )

        categories_done = {
            task.category
            for task in completed_today
            if task.category in {TaskCategory.HEALTH, TaskCategory.SOCIAL, TaskCategory.WORK}
        }

        if categories_done == {TaskCategory.HEALTH, TaskCategory.SOCIAL, TaskCategory.WORK}:
            user = UserRepository.get_user(session, user_id)
            if user is None:
                return False
            user.next_reward_multiplier = 1.5
            UserRepository.save(session, user)
            return True

        return False

    @staticmethod
    def apply_sloth_debuff(session: Session) -> int:
        cutoff = datetime.utcnow() - timedelta(days=3)
        affected = 0

        for user in UserRepository.list_users(session):
            recent = TaskRepository.get_completed_tasks_between(
                session=session,
                user_id=user.id,
                start_at=cutoff,
                end_at=datetime.utcnow(),
            )
            if recent:
                continue

            user.total_xp = int(user.total_xp * 0.95)
            user.current_level = max(1, (user.total_xp // 1000) + 1)
            UserRepository.save(session, user)
            affected += 1

        return affected
