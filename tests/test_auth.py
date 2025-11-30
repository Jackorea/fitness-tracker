def test_signup(client):
    response = client.post(
        "/signup",
        json={"email": "newuser@example.com", "password": "newpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data

def test_login(client):
    # Create unique user for login test to avoid conflict
    client.post(
        "/signup",
        json={"email": "loginuser@example.com", "password": "loginpassword"},
    )
    response = client.post(
        "/login",
        data={"username": "loginuser@example.com", "password": "loginpassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

