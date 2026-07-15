def test_register_new_user(client):
    response = client.post("/auth/register", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "alicepass123",
        "full_name": "Alice Smith"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "alice"
    assert data["email"] == "alice@example.com"
    assert "hashed_password" not in data
    assert "password" not in data


def test_register_duplicate_username_fails(client, registered_user):
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "different@example.com",
        "password": "somepass123",
        "full_name": "Someone Else"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_with_correct_credentials(client, registered_user):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_with_wrong_password_fails(client, registered_user):
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword"
    })
    assert response.status_code == 401


def test_login_with_nonexistent_username_fails(client):
    response = client.post("/auth/login", json={
        "username": "doesnotexist",
        "password": "whatever123"
    })
    assert response.status_code == 401


def test_protected_route_without_token_fails(client):
    response = client.get("/auth/me")
    assert response.status_code in (401, 403)


def test_protected_route_with_valid_token(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"