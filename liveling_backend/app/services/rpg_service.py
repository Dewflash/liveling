from datetime import UTC, datetime
import random
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.models.rpg_item import RPGItem
from app.models.rpg import RPGState
from app.repository.rpg_item_repo import RPGItemRepository
from app.repository.rpg_repo import RPGRepository
from app.repository.user_repo import UserRepository


class RPGService:
    AFFIX_POOL = [
        "Swift",
        "Brutal",
        "Ancient",
        "Sturdy",
        "Lucky",
        "Arcane",
    ]

    @staticmethod
    def _get_user_or_404(session: Session, user_id: UUID):
        user = UserRepository.get_user(session, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def _get_or_create_state(session: Session, user_id: UUID) -> RPGState:
        state = RPGRepository.get_state_by_user(session, user_id)
        if state is not None:
            return state
        return RPGRepository.create_state(session, user_id)

    @staticmethod
    def get_state(session: Session, user_id: UUID) -> RPGState:
        RPGService._get_user_or_404(session, user_id)
        return RPGService._get_or_create_state(session, user_id)

    @staticmethod
    def harvest_node(session: Session, user_id: UUID, node_type: str, quantity: int) -> tuple[RPGState, int, int, int]:
        user = RPGService._get_user_or_404(session, user_id)
        state = RPGService._get_or_create_state(session, user_id)

        # V1 economy: chopping trees yields wood + small coins + chance-like shard baseline.
        if node_type.lower() == "tree":
            wood_gained = quantity * 3
            credits_gained = quantity * 2
            shards_gained = quantity // 2
            trees_delta = quantity
            ore_delta = 0
        else:
            wood_gained = quantity
            credits_gained = quantity
            shards_gained = 0
            trees_delta = 0
            ore_delta = quantity

        UserRepository.update_user_balances(
            session=session,
            user=user,
            credits_increment=credits_gained,
        )

        updated = RPGRepository.apply_resource_delta(
            session=session,
            state=state,
            wood_delta=wood_gained,
            ore_delta=ore_delta,
            shards_delta=shards_gained,
            trees_delta=trees_delta,
            last_active_at=datetime.now(UTC).replace(tzinfo=None),
        )
        return updated, credits_gained, shards_gained, wood_gained

    @staticmethod
    def process_afk_tick(session: Session, user_id: UUID) -> tuple[RPGState, int, int, int, int]:
        user = RPGService._get_user_or_404(session, user_id)
        state = RPGService._get_or_create_state(session, user_id)

        now = datetime.now(UTC).replace(tzinfo=None)
        elapsed_minutes = max(0, int((now - state.last_active_at).total_seconds() // 60))

        if elapsed_minutes <= 0:
            return state, 0, 0, 0, 0

        capped_minutes = min(240, elapsed_minutes)
        wood_gained = capped_minutes // 4
        credits_gained = capped_minutes // 5
        shards_gained = capped_minutes // 20

        if credits_gained > 0:
            UserRepository.update_user_balances(
                session=session,
                user=user,
                credits_increment=credits_gained,
            )

        updated = RPGRepository.apply_resource_delta(
            session=session,
            state=state,
            wood_delta=wood_gained,
            shards_delta=shards_gained,
            last_active_at=now,
        )
        return updated, capped_minutes, credits_gained, shards_gained, wood_gained

    @staticmethod
    def _generate_drop(user_id: UUID, tier: str) -> RPGItem:
        slot = random.choice(["weapon", "armor", "artifact"])
        affix = random.choice(RPGService.AFFIX_POOL)
        if tier == "boss":
            rarity = "epic"
            base_power = 24
        elif tier == "elite":
            rarity = "rare"
            base_power = 14
        else:
            rarity = "common"
            base_power = 8

        power = base_power + random.randint(0, 6)
        item_name = f"{affix} {slot.title()}"
        return RPGItem(
            user_id=user_id,
            item_name=item_name,
            slot=slot,
            rarity=rarity,
            affix=affix,
            power=power,
            is_equipped=False,
        )

    @staticmethod
    def defeat_enemy(session: Session, user_id: UUID, enemy_tier: str) -> tuple[RPGState, str, int, int, RPGItem]:
        user = RPGService._get_user_or_404(session, user_id)
        state = RPGService._get_or_create_state(session, user_id)

        tier = enemy_tier.lower()
        if tier == "elite":
            credits_gained = 10
            shards_gained = 3
        elif tier == "boss":
            credits_gained = 24
            shards_gained = 8
        else:
            tier = "normal"
            credits_gained = 4
            shards_gained = 1

        UserRepository.update_user_balances(
            session=session,
            user=user,
            credits_increment=credits_gained,
        )

        updated = RPGRepository.apply_resource_delta(
            session=session,
            state=state,
            shards_delta=shards_gained,
            last_active_at=datetime.now(UTC).replace(tzinfo=None),
        )
        dropped_item = RPGService._generate_drop(user_id=user_id, tier=tier)
        dropped_item = RPGItemRepository.create_item(session, dropped_item)

        return updated, tier, credits_gained, shards_gained, dropped_item

    @staticmethod
    def list_inventory(session: Session, user_id: UUID) -> list[RPGItem]:
        RPGService._get_user_or_404(session, user_id)
        return RPGItemRepository.list_items_by_user(session, user_id)

    @staticmethod
    def equip_item(session: Session, user_id: UUID, item_id: UUID) -> tuple[RPGState, RPGItem]:
        RPGService._get_user_or_404(session, user_id)
        state = RPGService._get_or_create_state(session, user_id)
        item = RPGItemRepository.get_item(session, item_id)
        if item is None or item.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

        RPGItemRepository.clear_equipped_slot(session, user_id, item.slot)
        item.is_equipped = True
        item = RPGItemRepository.save(session, item)

        equipped = [it for it in RPGItemRepository.list_items_by_user(session, user_id) if it.is_equipped]
        state.gear_score = max(1, sum(it.power for it in equipped))
        state = RPGRepository.save(session, state)

        return state, item
