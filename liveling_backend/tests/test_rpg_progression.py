from datetime import UTC, datetime, timedelta


def _create_user(client, username: str) -> str:
    response = client.post("/api/v1/users", json={"username": username})
    assert response.status_code == 200
    return response.json()["id"]


def test_rpg_tick_awards_expected_resources_and_credits(client, monkeypatch):
    user_id = _create_user(client, "rpg_tick_user")

    state_resp = client.get(f"/api/v1/rpg/{user_id}/state")
    assert state_resp.status_code == 200
    start_state = state_resp.json()
    start_last_active = datetime.fromisoformat(start_state["last_active_at"])

    future_now = (start_last_active + timedelta(minutes=125)).replace(tzinfo=UTC)

    class FixedDateTime:
        @classmethod
        def now(cls, _tz=None):
            return future_now

    monkeypatch.setattr("app.services.rpg_service.datetime", FixedDateTime)

    tick_resp = client.post("/api/v1/rpg/tick", json={"user_id": user_id})
    assert tick_resp.status_code == 200
    body = tick_resp.json()

    assert body["afk_minutes"] == 125
    assert body["wood_gained"] == 31
    assert body["credits_gained"] == 25
    assert body["shards_gained"] == 6
    assert body["state"]["wood"] == 31
    assert body["state"]["relic_shards"] == 6

    profile_resp = client.get(f"/api/v1/users/{user_id}/profile")
    assert profile_resp.status_code == 200
    profile = profile_resp.json()
    assert profile["credits"] == 25


def test_rpg_tick_caps_elapsed_minutes_at_240(client, monkeypatch):
    user_id = _create_user(client, "rpg_tick_cap_user")

    state_resp = client.get(f"/api/v1/rpg/{user_id}/state")
    assert state_resp.status_code == 200
    start_state = state_resp.json()
    start_last_active = datetime.fromisoformat(start_state["last_active_at"])

    future_now = (start_last_active + timedelta(minutes=500)).replace(tzinfo=UTC)

    class FixedDateTime:
        @classmethod
        def now(cls, _tz=None):
            return future_now

    monkeypatch.setattr("app.services.rpg_service.datetime", FixedDateTime)

    tick_resp = client.post("/api/v1/rpg/tick", json={"user_id": user_id})
    assert tick_resp.status_code == 200
    body = tick_resp.json()

    assert body["afk_minutes"] == 240
    assert body["wood_gained"] == 60
    assert body["credits_gained"] == 48
    assert body["shards_gained"] == 12


def test_combat_unknown_tier_falls_back_to_normal_rewards(client):
    user_id = _create_user(client, "rpg_combat_fallback_user")

    combat_resp = client.post(
        "/api/v1/rpg/combat",
        json={"user_id": user_id, "enemy_tier": "mystery"},
    )
    assert combat_resp.status_code == 200
    body = combat_resp.json()

    assert body["enemy_tier"] == "normal"
    assert body["credits_gained"] == 4
    assert body["shards_gained"] == 1
    assert body["dropped_item"] is not None
    assert body["dropped_item"]["rarity"] == "common"
