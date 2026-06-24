def test_external_verification_is_restricted(client):
    create_user = client.post("/api/v1/users", json={"username": "charlie"})
    user_id = create_user.json()["id"]

    resp = client.get(f"/api/v1/external/users/{user_id}/verification")
    assert resp.status_code == 200

    body = resp.json()
    assert set(body.keys()) == {"current_level", "total_xp"}


def test_work_task_rewards_credit_wallet(client):
    user_resp = client.post("/api/v1/users", json={"username": "dora"})
    user_id = user_resp.json()["id"]

    task_resp = client.post(
        "/api/v1/tasks",
        json={
            "user_id": user_id,
            "title": "Finish report",
            "category": "WORK",
            "difficulty": 1,
        },
    )
    task_id = task_resp.json()["id"]

    complete_resp = client.post(f"/api/v1/tasks/{task_id}/complete")
    assert complete_resp.status_code == 200

    profile_resp = client.get(f"/api/v1/users/{user_id}/profile")
    profile = profile_resp.json()
    assert profile["credits"] == 50
    assert profile["custom_wallet"] == 0
