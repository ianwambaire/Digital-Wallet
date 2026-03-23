from fastapi import FastAPI
from .database import Base, engine
from .routes import users, wallet, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Wallet API")

app.include_router(users.router)
app.include_router(wallet.router)
app.include_router(transactions.router)


@app.get("/")
def root():
    return {"message": "Digital Wallet API is running"}