from pydantic import BaseModel
from typing import List as TypingList, Optional, Dict, Any
from datetime import datetime
import uuid


class Item(BaseModel):
    id: str
    rawText: Optional[str] = None
    name: str
    qty: Optional[float] = None
    unit: Optional[str] = None
    notes: Optional[str] = None
    category: str = "Other"
    createdAt: datetime
    updatedAt: datetime
    checked: bool = False


class GroceryList(BaseModel):
    listId: str
    spaceId: str
    version: int
    items: TypingList[Item]


class Space(BaseModel):
    spaceId: str
    name: str
    categoryOrder: TypingList[str] = []


class Room(BaseModel):
    roomCode: str
    pin: Optional[str] = None
    spaces: TypingList[Space]


class MergeRequest(BaseModel):
    roomCode: str
    spaceId: str
    clientVersion: int
    clientOps: TypingList[Dict[str, Any]]


class MergeResponse(BaseModel):
    serverVersion: int
    list: GroceryList


class CreateRoomRequest(BaseModel):
    pin: Optional[str] = None


class CreateRoomResponse(BaseModel):
    roomCode: str
    room: Room


class JoinRoomRequest(BaseModel):
    roomCode: str
    pin: Optional[str] = None


class JoinRoomResponse(BaseModel):
    success: bool
    room: Optional[Room] = None
    message: Optional[str] = None


class ParseRequest(BaseModel):
    text: str


class ParseResponse(BaseModel):
    items: TypingList[Item]
