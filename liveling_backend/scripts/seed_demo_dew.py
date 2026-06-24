from __future__ import annotations

from datetime import UTC, datetime, timedelta
from random import Random

from sqlmodel import Session, select

from app.db.session import create_db_and_tables, engine
from app.models.forest import ForestDesignUnlock, ForestSession
from app.models.rpg import RPGState
from app.models.rpg_item import RPGItem
from app.models.task import Task, TaskCategory
from app.models.user import User

USERNAME = "dew"
RNG = Random(77)

MISSION_TEMPLATES = [
    ("Deep work sprint: architecture notes", TaskCategory.WORK, 3),
    ("Ship feature branch + PR", TaskCategory.WORK, 3),
    ("Strength training session", TaskCategory.HEALTH, 2),
    ("30-minute zone 2 run", TaskCategory.HEALTH, 2),
    ("Mobility and stretch routine", TaskCategory.HEALTH, 1),
    ("Call a close friend", TaskCategory.SOCIAL, 1),
    ("Family catch-up", TaskCategory.SOCIAL, 2),
    ("Write journal reflection", TaskCategory.CUSTOM, 1),
    ("Study session: system design", TaskCategory.CUSTOM, 2),
    ("Inbox zero sweep", TaskCategory.WORK, 1),
]

CUSTOM_CATEGORIES = ["Learning", "Mindset", "Writing", "Life Admin"]
SPECIES = [
    ("oak", "Oak Sprout", "oak-original"),
    ("pine", "Pine Whisper", "pine-original"),
    ("maple", "Maple Ember", "maple-original"),
    ("bamboo", "Bamboo Pulse", "bonsai-online"),
    ("cedar", "Cedar Mist", "cedar-online"),
]


def ensure_user(session: Session) -> User:
    user = session.exec(select(User).where(User.username == USERNAME)).first()
    if user is None:
        user = User(username=USERNAME)
        session.add(user)
        session.commit()
        session.refresh(user)

    # Boost balances so shop/forest/game can be explored immediately.
    user.total_xp = 39200
    user.current_level = max(1, (user.total_xp // 1000) + 1)
    user.vitality = 6200
    user.essence = 7100
    user.credits = 12500
    user.custom_wallet = 3400
    user.next_reward_multiplier = 1.0
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def reseed_tasks(session: Session, user: User) -> None:
    existing = session.exec(select(Task).where(Task.user_id == user.id)).all()
    for task in existing:
        session.delete(task)
    session.commit()

    now = datetime.now(UTC).replace(tzinfo=None)
    entries: list[Task] = []

    for day_offset in range(30, 0, -1):
        day_anchor = now - timedelta(days=day_offset)
        tasks_today = 2 if day_offset % 5 else 3

        for slot in range(tasks_today):
            title, category, difficulty = MISSION_TEMPLATES[(day_offset + slot) % len(MISSION_TEMPLATES)]
            created_at = day_anchor.replace(hour=8 + slot * 4, minute=RNG.randint(0, 45), second=0, microsecond=0)
            done = RNG.random() < 0.8
            completed_at = (
                created_at + timedelta(hours=RNG.randint(1, 10), minutes=RNG.randint(0, 59)) if done else None
            )

            custom_category = None
            if category == TaskCategory.CUSTOM:
                custom_category = CUSTOM_CATEGORIES[(day_offset + slot) % len(CUSTOM_CATEGORIES)]

            entries.append(
                Task(
                    user_id=user.id,
                    title=f"{title} (Day -{day_offset})",
                    category=category,
                    custom_category=custom_category,
                    difficulty=difficulty,
                    is_completed=done,
                    created_at=created_at,
                    completed_at=completed_at,
                )
            )

    # Add a few current/pending missions visible at top of mission list.
    entries.extend(
        [
            Task(
                user_id=user.id,
                title="Plan weekend hiking route",
                category=TaskCategory.SOCIAL,
                difficulty=1,
                is_completed=False,
                created_at=now - timedelta(hours=6),
            ),
            Task(
                user_id=user.id,
                title="Forest focus session - 45 mins",
                category=TaskCategory.HEALTH,
                difficulty=2,
                is_completed=False,
                created_at=now - timedelta(hours=3),
            ),
            Task(
                user_id=user.id,
                title="Polish combat HUD for release build",
                category=TaskCategory.WORK,
                difficulty=3,
                is_completed=False,
                created_at=now - timedelta(hours=2),
            ),
        ]
    )

    session.add_all(entries)
    session.commit()


def reseed_forest(session: Session, user: User) -> None:
    for row in session.exec(select(ForestSession).where(ForestSession.user_id == user.id)).all():
        session.delete(row)
    for row in session.exec(select(ForestDesignUnlock).where(ForestDesignUnlock.user_id == user.id)).all():
        session.delete(row)
    session.commit()

    now = datetime.now(UTC).replace(tzinfo=None)
    sessions: list[ForestSession] = []
    for idx in range(72):
        species_id, species_name, design_id = SPECIES[idx % len(SPECIES)]
        focus_minutes = 25 + (idx % 4) * 10
        completed_at = now - timedelta(days=idx * 6 + 1, hours=RNG.randint(0, 8))
        sessions.append(
            ForestSession(
                user_id=user.id,
                species_id=species_id,
                species_name=species_name,
                focus_minutes=focus_minutes,
                reward_xp=focus_minutes * 4,
                reward_essence=focus_minutes * 2,
                design_id=design_id,
                completed_at=completed_at,
            )
        )

    unlocks = [
        ForestDesignUnlock(user_id=user.id, design_id="grove_design_1", cost_essence=120),
        ForestDesignUnlock(user_id=user.id, design_id="grove_design_2", cost_essence=240),
        ForestDesignUnlock(user_id=user.id, design_id="grove_design_3", cost_essence=360),
        ForestDesignUnlock(user_id=user.id, design_id="grove_design_4", cost_essence=520),
    ]

    session.add_all(sessions)
    session.add_all(unlocks)
    session.commit()


def reseed_rpg(session: Session, user: User) -> None:
    state = session.exec(select(RPGState).where(RPGState.user_id == user.id)).first()
    if state is None:
        state = RPGState(user_id=user.id)

    state.wood = 980
    state.iron_ore = 520
    state.relic_shards = 210
    state.gear_score = 74
    state.trees_chopped = 460
    state.last_active_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(minutes=5)
    session.add(state)

    for item in session.exec(select(RPGItem).where(RPGItem.user_id == user.id)).all():
        session.delete(item)

    items = [
        RPGItem(
            user_id=user.id,
            item_name="Verdant Edge",
            slot="weapon",
            rarity="epic",
            affix="crit+",
            power=38,
            is_equipped=True,
        ),
        RPGItem(
            user_id=user.id,
            item_name="Barkguard Mantle",
            slot="chest",
            rarity="rare",
            affix="hp+",
            power=24,
            is_equipped=True,
        ),
        RPGItem(
            user_id=user.id,
            item_name="Rootbound Ring",
            slot="ring",
            rarity="rare",
            affix="luck+",
            power=17,
            is_equipped=True,
        ),
        RPGItem(
            user_id=user.id,
            item_name="Stormforged Axe",
            slot="weapon",
            rarity="legendary",
            affix="aoe+",
            power=44,
            is_equipped=False,
        ),
    ]

    session.add_all(items)
    session.commit()


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        user = ensure_user(session)
        reseed_tasks(session, user)
        reseed_forest(session, user)
        reseed_rpg(session, user)

        task_count = len(session.exec(select(Task).where(Task.user_id == user.id)).all())
        completed_count = len(
            session.exec(select(Task).where(Task.user_id == user.id, Task.is_completed == True)).all()
        )

        print(f"Seed complete for username={user.username}, id={user.id}")
        print(f"Tasks: {task_count} total, {completed_count} completed")
        print(
            f"Balances: xp={user.total_xp}, level={user.current_level}, "
            f"vitality={user.vitality}, essence={user.essence}, credits={user.credits}, stars={user.custom_wallet}"
        )


if __name__ == "__main__":
    main()
