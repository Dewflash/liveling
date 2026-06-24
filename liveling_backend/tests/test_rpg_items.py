def test_combat_drop_is_returned_and_persisted(client):
    user_resp = client.post("/api/v1/users", json={"username": "rpg_drop_user"})
    assert user_resp.status_code == 200
    user_id = user_resp.json()["id"]

    before_resp = client.get(f"/api/v1/rpg/{user_id}/inventory")
    assert before_resp.status_code == 200
    before_items = before_resp.json()
    assert before_items == []

    combat_resp = client.post(
        "/api/v1/rpg/combat",
        json={"user_id": user_id, "enemy_tier": "normal"},
    )
    assert combat_resp.status_code == 200
    combat_body = combat_resp.json()
    dropped_item = combat_body["dropped_item"]

    assert dropped_item is not None
    assert dropped_item["user_id"] == user_id
    assert dropped_item["slot"] in {"weapon", "armor", "artifact"}
    assert dropped_item["affix"] in {"Swift", "Brutal", "Ancient", "Sturdy", "Lucky", "Arcane"}
    assert dropped_item["is_equipped"] is False

    after_resp = client.get(f"/api/v1/rpg/{user_id}/inventory")
    assert after_resp.status_code == 200
    after_items = after_resp.json()

    assert len(after_items) == 1
    assert after_items[0]["id"] == dropped_item["id"]


def test_equip_replaces_existing_item_in_same_slot_and_updates_gear_score(client, monkeypatch):
    user_resp = client.post("/api/v1/users", json={"username": "rpg_equip_user"})
    assert user_resp.status_code == 200
    user_id = user_resp.json()["id"]

    choice_values = iter(["weapon", "Swift", "weapon", "Brutal"])
    randint_values = iter([1, 5])

    def fake_choice(_options):
        return next(choice_values)

    def fake_randint(_a, _b):
        return next(randint_values)

    monkeypatch.setattr("app.services.rpg_service.random.choice", fake_choice)
    monkeypatch.setattr("app.services.rpg_service.random.randint", fake_randint)

    first_combat = client.post(
        "/api/v1/rpg/combat",
        json={"user_id": user_id, "enemy_tier": "normal"},
    )
    assert first_combat.status_code == 200
    first_item = first_combat.json()["dropped_item"]

    second_combat = client.post(
        "/api/v1/rpg/combat",
        json={"user_id": user_id, "enemy_tier": "normal"},
    )
    assert second_combat.status_code == 200
    second_item = second_combat.json()["dropped_item"]

    assert first_item["slot"] == "weapon"
    assert second_item["slot"] == "weapon"
    assert first_item["id"] != second_item["id"]

    first_equip = client.post(
        "/api/v1/rpg/equip",
        json={"user_id": user_id, "item_id": first_item["id"]},
    )
    assert first_equip.status_code == 200
    first_equip_body = first_equip.json()

    assert first_equip_body["equipped_item"]["id"] == first_item["id"]
    assert first_equip_body["state"]["gear_score"] == first_item["power"]

    second_equip = client.post(
        "/api/v1/rpg/equip",
        json={"user_id": user_id, "item_id": second_item["id"]},
    )
    assert second_equip.status_code == 200
    second_equip_body = second_equip.json()

    assert second_equip_body["equipped_item"]["id"] == second_item["id"]
    assert second_equip_body["state"]["gear_score"] == second_item["power"]

    inventory_resp = client.get(f"/api/v1/rpg/{user_id}/inventory")
    assert inventory_resp.status_code == 200
    inventory = inventory_resp.json()

    item_by_id = {item["id"]: item for item in inventory}
    assert item_by_id[first_item["id"]]["is_equipped"] is False
    assert item_by_id[second_item["id"]]["is_equipped"] is True
