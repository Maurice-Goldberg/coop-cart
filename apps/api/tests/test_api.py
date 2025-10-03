import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from models import GroceryList, Item

client = TestClient(app)

class TestRoomManagement:
    def test_create_room_clears_existing_data(self):
        """Creating a new room should start with empty list"""
        # First, add some items to a room
        response1 = client.post("/api/room/create")
        room1 = response1.json()["room"]
        
        # Add items to first room
        client.post("/api/list/merge", json={
            "spaceId": "default",
            "clientOps": [{
                "type": "add_item",
                "data": {"item": {
                    "id": "1",
                    "name": "milk",
                    "category": "Other",
                    "checked": False
                }}
            }]
        })
        
        # Create new room
        response2 = client.post("/api/room/create")
        room2 = response2.json()["room"]
        
        # New room should have empty list
        assert room2["roomCode"] != room1["roomCode"]
        
        # Get list for new room - should be empty
        list_response = client.post("/api/list/merge", json={
            "spaceId": "default",
            "clientOps": []
        })
        assert len(list_response.json()["list"]["items"]) == 0

class TestItemCategorization:
    def test_items_are_categorized_on_sync(self):
        """Items should be automatically categorized by LLM"""
        # Create room
        response = client.post("/api/room/create")
        room = response.json()["room"]
        
        # Add uncategorized items
        merge_response = client.post("/api/list/merge", json={
            "spaceId": "default",
            "clientOps": [
                {
                    "type": "add_item",
                    "data": {"item": {
                        "id": "1",
                        "name": "milk",
                        "category": "Other",
                        "checked": False
                    }}
                },
                {
                    "type": "add_item", 
                    "data": {"item": {
                        "id": "2",
                        "name": "apples",
                        "category": "Other",
                        "checked": False
                    }}
                }
            ]
        })
        
        items = merge_response.json()["list"]["items"]
        
        # Items should be categorized
        assert len(items) > 0
        milk_item = next((item for item in items if item["name"] == "milk"), None)
        assert milk_item is not None
        assert milk_item["category"] != "Other"  # Should be categorized
        
        apple_item = next((item for item in items if item["name"] == "apples"), None)
        assert apple_item is not None
        assert apple_item["category"] != "Other"  # Should be categorized

class TestDeduplication:
    def test_duplicate_items_are_merged(self):
        """Similar items should be deduplicated"""
        response = client.post("/api/room/create")
        
        # Add duplicate items
        merge_response = client.post("/api/list/merge", json={
            "spaceId": "default",
            "clientOps": [
                {
                    "type": "add_item",
                    "data": {"item": {
                        "id": "1",
                        "name": "milk 1 gallon",
                        "category": "Other",
                        "checked": False
                    }}
                },
                {
                    "type": "add_item",
                    "data": {"item": {
                        "id": "2", 
                        "name": "1 gallon milk",
                        "category": "Other",
                        "checked": False
                    }}
                }
            ]
        })
        
        items = merge_response.json()["list"]["items"]
        
        # Should have fewer items due to deduplication
        assert len(items) < 2
        # Should have one milk item
        milk_items = [item for item in items if "milk" in item["name"].lower()]
        assert len(milk_items) == 1

class TestAPIEndpoints:
    def test_create_room_endpoint(self):
        """Test room creation endpoint"""
        response = client.post("/api/room/create")
        assert response.status_code == 200
        
        data = response.json()
        assert "room" in data
        assert "roomCode" in data["room"]
        assert len(data["room"]["roomCode"]) == 6  # 6-character room code

    def test_join_room_endpoint(self):
        """Test room joining endpoint"""
        # First create a room
        create_response = client.post("/api/room/create")
        room_code = create_response.json()["room"]["roomCode"]
        
        # Then join it
        join_response = client.post("/api/room/join", json={
            "roomCode": room_code
        })
        
        assert join_response.status_code == 200
        data = join_response.json()
        assert data["success"] == True
        assert data["room"]["roomCode"] == room_code

    def test_parse_endpoint(self):
        """Test text parsing endpoint"""
        response = client.post("/api/parse", json={
            "text": "milk, bread, eggs"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) == 3

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
