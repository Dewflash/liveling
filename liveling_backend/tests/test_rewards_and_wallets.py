def test_custom_task_rewards_go_to_custom_wallet(client):
    user_resp = client.post("/api/v1/users", json={"username": "alice"})
    assert user_resp.status_code == 200
    user_id = user_resp.json()["id"]

    task_resp = client.post(
        "/api/v1/tasks",
        json={
            "user_id": user_id,
            "title": "Design moodboard",
            "category": "CUSTOM",
            "custom_category": "CREATIVE",
            "difficulty": 2,
        },
    )
    assert task_resp.status_code == 200
    task_id = task_resp.json()["id"]

    complete_resp = client.post(f"/api/v1/tasks/{task_id}/complete")
    assert complete_resp.status_code == 200
    body = complete_resp.json()
    assert body["reward_xp"] == 100

    profile_resp = client.get(f"/api/v1/users/{user_id}/profile")
    assert profile_resp.status_code == 200
    profile = profile_resp.json()
    assert profile["total_xp"] == 100
    assert profile["custom_wallet"] == 100
    assert profile["credits"] == 0


def test_credits_can_buy_star_points_via_shop(client):
    user_resp = client.post("/api/v1/users", json={"username": "bob"})
    user_id = user_resp.json()["id"]

    for idx in range(2):
        task_resp = client.post(
            "/api/v1/tasks",
            json={
                "user_id": user_id,
                "title": f"Work task {idx}",
                "category": "WORK",
                "difficulty": 2,
            },
        )
        task_id = task_resp.json()["id"]
        complete_resp = client.post(f"/api/v1/tasks/{task_id}/complete")
        assert complete_resp.status_code == 200

    buy_resp = client.post(
        "/api/v1/shop/buy",
        json={
            "user_id": user_id,
            "item_type": "BUY_STAR_POINTS",
            "amount": 10,
        },
    )
    assert buy_resp.status_code == 200
    buy_body = buy_resp.json()
    assert buy_body["item"] == "star_points"
    assert buy_body["cost"] == 40
    assert buy_body["amount_purchased"] == 10

    profile_resp = client.get(f"/api/v1/users/{user_id}/profile")
    profile = profile_resp.json()
    assert profile["credits"] == 160
    assert profile["custom_wallet"] == 10
