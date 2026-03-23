from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Wallet, Transaction
from ..schemas import WalletResponse, DepositRequest, TransferRequest
from ..auth import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("", response_model=WalletResponse)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@router.post("/deposit")
def deposit_money(
    request: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    wallet.balance += request.amount

    transaction = Transaction(
        sender_id=None,
        receiver_id=current_user.id,
        transaction_type="deposit",
        amount=request.amount
    )

    db.add(transaction)
    db.commit()
    db.refresh(wallet)

    return {
        "message": "Deposit successful",
        "new_balance": wallet.balance
    }


@router.post("/transfer")
def transfer_money(
    request: TransferRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.email == request.recipient_email:
        raise HTTPException(status_code=400, detail="You cannot transfer money to yourself")

    sender_wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    recipient = db.query(User).filter(User.email == request.recipient_email).first()

    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    recipient_wallet = db.query(Wallet).filter(Wallet.user_id == recipient.id).first()

    if not sender_wallet:
        raise HTTPException(status_code=404, detail="Sender wallet not found")

    if not recipient_wallet:
        raise HTTPException(status_code=404, detail="Recipient wallet not found")

    if sender_wallet.balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    try:
        sender_wallet.balance -= request.amount
        recipient_wallet.balance += request.amount

        transaction = Transaction(
            sender_id=current_user.id,
            receiver_id=recipient.id,
            transaction_type="transfer",
            amount=request.amount
        )

        db.add(transaction)
        db.commit()
        db.refresh(sender_wallet)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transfer failed")

    return {
        "message": "Transfer successful",
        "sender_new_balance": sender_wallet.balance
    }