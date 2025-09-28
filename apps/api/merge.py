"""
Merge operations and versioning logic.
"""

from typing import List, Dict, Any
from models import Item, GroceryList
from datetime import datetime
import uuid


def apply_ops(base_list: GroceryList, ops: List[Dict[str, Any]]) -> GroceryList:
    """
    Apply a list of operations to a base list.
    Returns a new list with operations applied.
    """
    # Create a copy of the base list
    new_list = GroceryList(
        listId=base_list.listId,
        spaceId=base_list.spaceId,
        version=base_list.version,
        items=[item.model_copy() for item in base_list.items]
    )
    
    for op in ops:
        op_type = op.get("type")
        
        if op_type == "add_item":
            item_data = op.get("item", {})
            new_item = Item(
                id=item_data.get("id", str(uuid.uuid4())),
                rawText=item_data.get("rawText"),
                name=item_data.get("name", ""),
                qty=item_data.get("qty"),
                unit=item_data.get("unit"),
                notes=item_data.get("notes"),
                category=item_data.get("category", "Other"),
                createdAt=datetime.fromisoformat(item_data.get("createdAt", datetime.now().isoformat())),
                updatedAt=datetime.fromisoformat(item_data.get("updatedAt", datetime.now().isoformat())),
                checked=item_data.get("checked", False)
            )
            new_list.items.append(new_item)
            
        elif op_type == "update_item":
            item_id = op.get("id")
            patch = op.get("patch", {})
            
            for item in new_list.items:
                if item.id == item_id:
                    for key, value in patch.items():
                        if hasattr(item, key):
                            setattr(item, key, value)
                    item.updatedAt = datetime.now()
                    break
                    
        elif op_type == "toggle_item":
            item_id = op.get("id")
            
            for item in new_list.items:
                if item.id == item_id:
                    item.checked = not item.checked
                    item.updatedAt = datetime.now()
                    break
                    
        elif op_type == "remove_item":
            item_id = op.get("id")
            new_list.items = [item for item in new_list.items if item.id != item_id]
    
    return new_list
