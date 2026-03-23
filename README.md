# Digital Wallet API

A backend wallet/payment API built with FastAPI.

## Features
- User registration and login (JWT authentication)
- Protected user profile endpoint
- Wallet balance management
- Deposit funds
- Peer-to-peer transfers
- Transaction history tracking

## Tech Stack
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- pwdlib (Argon2 hashing)

## Example Flow
1. Register user
2. Login to get access token
3. Deposit money
4. Transfer money to another user
5. View transaction history

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

API Docs

http://127.0.0.1:8000/docs