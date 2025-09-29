"""
Categorizer and deduplication logic.
This is a rules-based stub that can be replaced with an LLM provider.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from models import Item
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Category keyword mapping
CATEGORY_KEYWORDS = {
    "Dairy & Eggs": [
        "milk", "cheese", "butter", "yogurt", "cream", "eggs", "dairy", "sour cream",
        "cottage cheese", "mozzarella", "cheddar", "parmesan", "swiss", "american cheese"
    ],
    "Produce": [
        "apple", "banana", "orange", "lettuce", "tomato", "onion", "carrot", "potato",
        "broccoli", "spinach", "cucumber", "pepper", "garlic", "lemon", "lime",
        "avocado", "strawberry", "blueberry", "grape", "cherry", "peach", "pear"
    ],
    "Meat & Seafood": [
        "chicken", "beef", "pork", "fish", "salmon", "tuna", "shrimp", "turkey",
        "ham", "bacon", "sausage", "ground beef", "steak", "chops", "wings"
    ],
    "Pantry": [
        "rice", "pasta", "bread", "cereal", "flour", "sugar", "salt", "pepper",
        "oil", "vinegar", "sauce", "soup", "crackers", "chips", "nuts", "beans"
    ],
    "Frozen": [
        "frozen", "ice cream", "pizza", "frozen vegetables", "frozen fruit"
    ],
    "Beverages": [
        "water", "juice", "soda", "coffee", "tea", "beer", "wine", "sports drink"
    ],
    "Bakery": [
        "bread", "rolls", "bagels", "muffins", "croissants", "cake", "cookies"
    ]
}


def normalize_name(name: str) -> str:
    """Normalize item name for comparison and categorization."""
    # Convert to lowercase
    normalized = name.lower().strip()
    
    # Remove common articles
    normalized = re.sub(r'\b(the|a|an)\b', '', normalized).strip()
    
    # Handle plurals (basic)
    if normalized.endswith('s') and len(normalized) > 3:
        # Don't remove 's' from words ending in 'ss' or short words
        if not normalized.endswith('ss') and not normalized.endswith('ies'):
            normalized = normalized[:-1]
    
    return normalized


def parse_quantity_and_unit(text: str) -> Tuple[Optional[float], Optional[str]]:
    """Parse quantity and unit from text."""
    # Common unit patterns
    unit_patterns = {
        r'\b(\d+(?:\.\d+)?)\s*(gal|gallon)s?\b': ('gal', 1.0),
        r'\b(\d+(?:\.\d+)?)\s*(lb|lbs|pound)s?\b': ('lb', 1.0),
        r'\b(\d+(?:\.\d+)?)\s*(oz|ounce)s?\b': ('oz', 1.0),
        r'\b(\d+(?:\.\d+)?)\s*(dozen)s?\b': ('dozen', 12.0),
        r'\b(\d+(?:\.\d+)?)\s*(pack)s?\b': ('pack', 1.0),
        r'\b(\d+(?:\.\d+)?)\s*(kg|kilogram)s?\b': ('kg', 1.0),
        r'\b(\d+(?:\.\d+)?)\s*(g|gram)s?\b': ('g', 1.0),
    }
    
    for pattern, (unit, multiplier) in unit_patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            qty = float(match.group(1)) * multiplier
            return qty, unit
    
    # Look for just numbers
    number_match = re.search(r'\b(\d+(?:\.\d+)?)\b', text)
    if number_match:
        return float(number_match.group(1)), None
    
    return None, None


def categorize_item(item: Item) -> str:
    """Categorize an item based on its name."""
    normalized_name = normalize_name(item.name)
    
    # Check each category
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in normalized_name:
                return category
    
    return "Other"


def get_dedupe_key(item: Item) -> str:
    """Get a key for deduplication based on normalized name and unit."""
    normalized_name = normalize_name(item.name)
    unit = item.unit or ""
    return f"{normalized_name}|{unit}"


def categorize_and_dedupe(items: List[Item]) -> List[Item]:
    """
    Categorize items and deduplicate similar ones.
    This is the main function that can be replaced with an LLM provider.
    """
    # First, parse quantities and units for all items
    for item in items:
        if not item.qty or not item.unit:
            qty, unit = parse_quantity_and_unit(item.name)
            if qty:
                item.qty = qty
            if unit:
                item.unit = unit
    
    # Categorize all items
    for item in items:
        item.category = categorize_item(item)
    
    # Deduplicate
    dedupe_map: Dict[str, Item] = {}
    
    for item in items:
        key = get_dedupe_key(item)
        
        if key in dedupe_map:
            existing = dedupe_map[key]
            
            # Merge quantities if both have them
            if existing.qty and item.qty:
                existing.qty += item.qty
            elif item.qty and not existing.qty:
                existing.qty = item.qty
            
            # Merge notes
            if item.notes and not existing.notes:
                existing.notes = item.notes
            elif item.notes and existing.notes:
                existing.notes = f"{existing.notes}, {item.notes}"
            
            # Prefer non-"Other" category
            if item.category != "Other" and existing.category == "Other":
                existing.category = item.category
            
            # Update timestamp
            existing.updatedAt = item.updatedAt
            
        else:
            dedupe_map[key] = item
    
    # Sort by category and name
    result = list(dedupe_map.values())
    result.sort(key=lambda x: (x.category, x.name.lower()))
    
    return result


def llm_categorize_and_dedupe(items: List[Item]) -> List[Item]:
    """
    LLM-based categorizer with plug-in support.
    Set LLM_PROVIDER and LLM_API_KEY environment variables to use.
    """
    provider = os.getenv("LLM_PROVIDER")
    api_key = os.getenv("LLM_API_KEY")
    
    if provider and api_key and api_key != "your_api_key_here":
        # TODO: Implement actual LLM integration based on provider
        if provider.lower() == "openai":
            # return openai_categorize_and_dedupe(items, api_key)
            pass
        elif provider.lower() == "anthropic":
            # return anthropic_categorize_and_dedupe(items, api_key)
            pass
        elif provider.lower() == "cohere":
            # return cohere_categorize_and_dedupe(items, api_key)
            pass
        else:
            print(f"Unknown LLM provider: {provider}")
    
    # Fall back to rules-based approach
    return categorize_and_dedupe(items)
