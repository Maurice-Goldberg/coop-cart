"""
FastAPI backend for CoopCart.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import string
import random
from datetime import datetime
import uuid

from models import (
    CreateRoomRequest, CreateRoomResponse, JoinRoomRequest, JoinRoomResponse,
    ParseRequest, ParseResponse, MergeRequest, MergeResponse, Room, Space, GroceryList, Item
)
from merge import apply_ops
from llm import llm_categorize_and_dedupe

app = FastAPI(title="CoopCart API", version="1.0.0")

# Enable CORS for all origins (MVP)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (MVP)
rooms: Dict[str, Room] = {}
lists: Dict[str, GroceryList] = {}


def generate_room_code() -> str:
    """Generate a 6-8 character alphanumeric room code."""
    # Exclude ambiguous characters (0, O, I, l, 1)
    chars = string.ascii_uppercase + string.digits
    chars = chars.replace('0', '').replace('O', '').replace('I', '').replace('1', '')
    return ''.join(random.choices(chars, k=6))


@app.post("/api/room/create", response_model=CreateRoomResponse)
async def create_room(request: CreateRoomRequest):
    """Create a new room and return the room code."""
    room_code = generate_room_code()
    
    # Create default space
    default_space = Space(
        spaceId="default",
        name="Grocery List",
        categoryOrder=["Dairy & Eggs", "Produce", "Meat & Seafood", "Pantry", "Frozen", "Beverages", "Bakery", "Other"]
    )
    
    # Create room
    room = Room(
        roomCode=room_code,
        pin=request.pin,
        spaces=[default_space]
    )
    
    # Create empty list for default space
    empty_list = GroceryList(
        listId=str(uuid.uuid4()),
        spaceId="default",
        version=0,
        items=[]
    )
    
    # Store in memory
    rooms[room_code] = room
    lists["default"] = empty_list
    
    return CreateRoomResponse(roomCode=room_code, room=room)


@app.post("/api/room/join", response_model=JoinRoomResponse)
async def join_room(request: JoinRoomRequest):
    """Join an existing room by room code."""
    if request.roomCode not in rooms:
        return JoinRoomResponse(
            success=False,
            message="Room not found"
        )
    
    room = rooms[request.roomCode]
    
    # Check PIN if required
    if room.pin and room.pin != request.pin:
        return JoinRoomResponse(
            success=False,
            message="Invalid PIN"
        )
    
    return JoinRoomResponse(
        success=True,
        room=room
    )


@app.post("/api/parse", response_model=ParseResponse)
async def parse_text(request: ParseRequest):
    """Parse freeform text into items."""
    # Treat the entire input as a single item
    text = request.text.strip()
    if not text:
        return ParseResponse(items=[])
    
    now = datetime.now()
    item = Item(
        id=str(uuid.uuid4()),
        rawText=text,
        name=text,
        category="Other",
        createdAt=now,
        updatedAt=now,
        checked=False
    )
    
    # Use LLM categorization to properly categorize the item
    from llm import llm_categorize_and_dedupe
    items = llm_categorize_and_dedupe([item])
    
    return ParseResponse(items=items)


@app.post("/api/list/merge", response_model=MergeResponse)
async def merge_list(request: MergeRequest):
    """Merge client operations with server list."""
    # Get current server list
    if request.spaceId not in lists:
        raise HTTPException(status_code=404, detail="Space not found")
    
    server_list = lists[request.spaceId]
    
    # Check if client is up to date
    if request.clientVersion != server_list.version:
        # Client is out of date, return current server list
        return MergeResponse(
            serverVersion=server_list.version,
            list=server_list
        )
    
    # Apply client operations
    new_list = apply_ops(server_list, request.clientOps)
    
    # Categorize and dedupe
    categorized_items = llm_categorize_and_dedupe(new_list.items)
    
    # Update list
    new_list.items = categorized_items
    new_list.version += 1
    
    # Persist
    lists[request.spaceId] = new_list
    
    return MergeResponse(
        serverVersion=new_list.version,
        list=new_list
    )


@app.get("/api/list/{space_id}", response_model=MergeResponse)
async def get_list(space_id: str):
    """Get the current list state for a space."""
    if space_id not in lists:
        raise HTTPException(status_code=404, detail="Space not found")
    
    server_list = lists[space_id]
    
    return MergeResponse(
        serverVersion=server_list.version,
        list=server_list
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "rooms": len(rooms), "lists": len(lists)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
