from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Transaction
from ..schemas import TransactionResponse
from ..auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=list[TransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = db.query(Transaction).filter(
        (Transaction.sender_id == current_user.id) |
        (Transaction.receiver_id == current_user.id)
    ).order_by(Transaction.created_at.desc()).all()

    results = []
    for transaction in transactions:
        sender = transaction.sender
        receiver = transaction.receiver

        results.append(
            TransactionResponse(
                id=transaction.id,
                sender_id=transaction.sender_id,
                receiver_id=transaction.receiver_id,
                sender_name=sender.name if sender else None,
                receiver_name=receiver.name if receiver else None,
                sender_email=sender.email if sender else None,
                receiver_email=receiver.email if receiver else None,
                transaction_type=transaction.transaction_type,
                amount=transaction.amount,
                created_at=transaction.created_at,
            )
        )

    return results