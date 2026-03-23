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

    return transactions