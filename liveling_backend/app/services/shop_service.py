from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session

from app.repository.user_repo import UserRepository


class ShopService:
    ESSENCE_CREDIT_RATE = 2
    SWORD_STATS_CREDIT_RATE = 3
    STAR_POINTS_CREDIT_RATE = 4

    @staticmethod
    def _get_user_or_404(session: Session, user_id: UUID):
        user = UserRepository.get_user(session, user_id)
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @staticmethod
    def _buy_currency_with_credits(
        session: Session,
        user_id: UUID,
        amount: int,
        item_label: str,
        credit_rate: int,
        essence_increment: int = 0,
        vitality_increment: int = 0,
        custom_wallet_increment: int = 0,
    ) -> dict[str, str | int]:
        if amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be > 0")

        user = ShopService._get_user_or_404(session, user_id)
        total_cost = amount * credit_rate
        if user.credits < total_cost:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough Credits")

        UserRepository.update_user_balances(
            session=session,
            user=user,
            credits_increment=-total_cost,
            essence_increment=essence_increment,
            vitality_increment=vitality_increment,
            custom_wallet_increment=custom_wallet_increment,
        )

        return {
            "status": "success",
            "item": item_label,
            "cost": total_cost,
            "amount_purchased": amount,
        }

    @staticmethod
    def buy_tree_essence(session: Session, user_id: UUID, amount: int) -> dict[str, str | int]:
        return ShopService._buy_currency_with_credits(
            session=session,
            user_id=user_id,
            amount=amount,
            item_label="tree_essence",
            credit_rate=ShopService.ESSENCE_CREDIT_RATE,
            essence_increment=amount,
        )

    @staticmethod
    def buy_sword_stats(session: Session, user_id: UUID, amount: int) -> dict[str, str | int]:
        return ShopService._buy_currency_with_credits(
            session=session,
            user_id=user_id,
            amount=amount,
            item_label="sword_stats",
            credit_rate=ShopService.SWORD_STATS_CREDIT_RATE,
            vitality_increment=amount,
        )

    @staticmethod
    def buy_star_points(session: Session, user_id: UUID, amount: int) -> dict[str, str | int]:
        return ShopService._buy_currency_with_credits(
            session=session,
            user_id=user_id,
            amount=amount,
            item_label="star_points",
            credit_rate=ShopService.STAR_POINTS_CREDIT_RATE,
            custom_wallet_increment=amount,
        )
