def test_create_workout(client, auth_headers):
    response = client.post(
        "/workouts/",
        headers=auth_headers,
        json={
            "name": "Leg Day",
            "is_public": True,
            "exercises": [
                {
                    "name": "Squat",
                    "sets": [{"weight": 100.0, "reps": 5}]
                }
            ]
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Leg Day"
    assert len(data["exercises"]) == 1
    assert data["exercises"][0]["sets"][0]["weight"] == 100.0

def test_read_workouts(client, auth_headers):
    response = client.get("/workouts/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_public_workouts(client, auth_headers):
    response = client.get("/workouts/public", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # We created a public workout in test_create_workout, so at least 1 should be there
    assert len(data) >= 1
    assert data[0]["is_public"] == True

