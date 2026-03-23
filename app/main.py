from fastapi import FastAPI
from .database import Base, engine

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Wallet API")


@app.get("/")
def root():
    return {"message": "Digital Wallet API is running"}