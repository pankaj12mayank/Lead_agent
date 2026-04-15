"""User accounts for JWT API auth (SQLAlchemy + SQLite)."""

from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional

import bcrypt
from sqlalchemy import select

from database.orm.bootstrap import get_session_factory
from database.orm.models import User
from settings.lead_schema import utc_now_iso


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("ascii"))
    except ValueError:
        return False


def create_user(email: str, password: str) -> Dict[str, Any]:
    uid = str(uuid.uuid4())
    em = email.strip().lower()
    Session = get_session_factory()
    db = Session()
    try:
        if db.scalar(select(User.id).where(User.email == em)):
            raise ValueError("email_taken")
        u = User(
            id=uid,
            email=em,
            password_hash=hash_password(password),
            created_at=utc_now_iso(),
        )
        db.add(u)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
    return get_user_by_id(uid)


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    Session = get_session_factory()
    db = Session()
    try:
        u = db.get(User, user_id)
        if not u:
            return None
        return {"id": u.id, "email": u.email, "created_at": u.created_at}
    finally:
        db.close()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    Session = get_session_factory()
    db = Session()
    try:
        em = email.strip().lower()
        u = db.scalar(select(User).where(User.email == em))
        if not u:
            return None
        return {
            "id": u.id,
            "email": u.email,
            "password_hash": u.password_hash,
            "created_at": u.created_at,
        }
    finally:
        db.close()


def authenticate(email: str, password: str) -> Optional[Dict[str, Any]]:
    row = get_user_by_email(email)
    if not row:
        return None
    if not verify_password(password, row["password_hash"]):
        return None
    return get_user_by_id(row["id"])


def list_users() -> List[Dict[str, Any]]:
    Session = get_session_factory()
    db = Session()
    try:
        rows = db.scalars(select(User).order_by(User.created_at.desc())).all()
        return [{"id": u.id, "email": u.email, "created_at": u.created_at} for u in rows]
    finally:
        db.close()
