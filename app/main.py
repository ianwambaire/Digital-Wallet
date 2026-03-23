from fastapi import FastAPI
from .database import Base, engine
from .routes import users, wallet, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Digital Wallet API",
    description="A backend wallet API built with FastAPI",
    version="1.0.0"
)

app.include_router(users.router)
app.include_router(wallet.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    return {
        "message": "Digital Wallet API is running",
        "docs": "/docs"
    }