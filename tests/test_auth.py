from __future__ import annotations

import uuid


def test_register_and_login(client):
    email = f"pytest_{uuid.uuid4().hex[:12]}@example.com"
    password = "pytest-password-9"

    reg = client.post("/auth/register", json={"email": email, "password": password})
    assert reg.status_code == 200, reg.text
    token = reg.json()["access_token"]
    assert token

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == email.lower()

    login = client.post("/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    assert login.json()["access_token"]
