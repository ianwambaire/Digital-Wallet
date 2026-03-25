from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class WalletResponse(BaseModel):
    balance: float

    class Config:
        from_attributes = True


class DepositRequest(BaseModel):
    amount: float = Field(gt=0)

    @field_validator("amount")
    @classmethod
    def round_amount(cls, value: float) -> float:
        return round(value, 2)


class TransferRequest(BaseModel):
    recipient_email: EmailStr
    amount: float = Field(gt=0)

    @field_validator("amount")
    @classmethod
    def round_amount(cls, value: float) -> float:
        return round(value, 2)


class TransactionResponse(BaseModel):
    id: int
    sender_id: int | None
    receiver_id: int | None
    sender_name: str | None = None
    receiver_name: str | None = None
    sender_email: str | None = None
    receiver_email: str | None = None
    transaction_type: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True