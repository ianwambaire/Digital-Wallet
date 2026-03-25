from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import users, wallet, transactions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Digital Wallet API",
    description="A backend wallet API built with FastAPI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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