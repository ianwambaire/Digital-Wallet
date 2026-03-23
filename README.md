# Digital Wallet API

A backend wallet/payment API built with FastAPI.

## Features
- User registration
- User login with JWT authentication
- Protected user profile route
- Wallet balance check
- Deposit money
- Peer-to-peer transfer
- Transaction history

## Tech Stack
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT
- pwdlib with Argon2

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload