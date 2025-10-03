"""
Categorizer and deduplication logic.
This is a rules-based stub that can be replaced with an LLM provider.
"""

import re
import json
import requests
from typing import List, Dict, Any, Optional, Tuple
from models import Item
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


# Category keyword mapping
CATEGORY_KEYWORDS = {
    "Dairy & Eggs": [
        "milk", "cheese", "butter", "yogurt", "cream", "eggs", "egg", "dairy", "sour cream",
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
            # Keep important plurals that are in our keywords
            important_plurals = ['eggs', 'chips', 'nuts', 'beans']
            if normalized not in important_plurals:
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
        try:
            if provider.lower() == "openai":
                return openai_categorize_and_dedupe(items, api_key)
            elif provider.lower() == "anthropic":
                return anthropic_categorize_and_dedupe(items, api_key)
            elif provider.lower() == "cohere":
                return cohere_categorize_and_dedupe(items, api_key)
            else:
                print(f"Unknown LLM provider: {provider}")
        except Exception as e:
            print(f"LLM categorization failed: {e}")
            print("Falling back to rules-based approach")
    
    # Fall back to rules-based approach
    return categorize_and_dedupe(items)


def openai_categorize_and_dedupe(items: List[Item], api_key: str) -> List[Item]:
    """Use OpenAI API to categorize and deduplicate items."""
    try:
        import openai
        client = openai.OpenAI(api_key=api_key)
        
        # Prepare items for LLM
        item_names = [item.name for item in items]
        
        prompt = f"""
You are a grocery list categorizer. Categorize these items into appropriate grocery store categories:

Items: {', '.join(item_names)}

Categories to choose from:
- Dairy & Eggs (milk, cheese, eggs, yogurt, butter, etc.)
- Produce (fruits, vegetables, herbs)
- Meat & Seafood (chicken, beef, fish, pork, etc.)
- Pantry (rice, pasta, bread, cereal, canned goods, etc.)
- Frozen (frozen foods, ice cream, frozen vegetables)
- Beverages (drinks, water, juice, coffee, tea, etc.)
- Bakery (fresh bread, pastries, cakes, etc.)
- Other (anything that doesn't fit the above categories)

Also identify any duplicate items that should be merged (e.g., "milk" and "1 gallon milk" should be merged).

Return a JSON response with this structure:
{{
    "categorized_items": [
        {{
            "name": "item name",
            "category": "category name",
            "merged_with": ["list of duplicate item names to merge with"]
        }}
    ]
}}

Only return the JSON, no other text.
"""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Process LLM results
        return process_llm_results(items, result)
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        raise


def anthropic_categorize_and_dedupe(items: List[Item], api_key: str) -> List[Item]:
    """Use Anthropic API to categorize and deduplicate items."""
    try:
        item_names = [item.name for item in items]
        
        prompt = f"""
You are a grocery list categorizer. Categorize these items into appropriate grocery store categories:

Items: {', '.join(item_names)}

Categories to choose from:
- Dairy & Eggs (milk, cheese, eggs, yogurt, butter, etc.)
- Produce (fruits, vegetables, herbs)
- Meat & Seafood (chicken, beef, fish, pork, etc.)
- Pantry (rice, pasta, bread, cereal, canned goods, etc.)
- Frozen (frozen foods, ice cream, frozen vegetables)
- Beverages (drinks, water, juice, coffee, tea, etc.)
- Bakery (fresh bread, pastries, cakes, etc.)
- Other (anything that doesn't fit the above categories)

Also identify any duplicate items that should be merged (e.g., "milk" and "1 gallon milk" should be merged).

Return a JSON response with this structure:
{{
    "categorized_items": [
        {{
            "name": "item name",
            "category": "category name",
            "merged_with": ["list of duplicate item names to merge with"]
        }}
    ]
}}

Only return the JSON, no other text.
"""
        
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Anthropic API error: {response.status_code} - {response.text}")
        
        result = json.loads(response.json()["content"][0]["text"])
        return process_llm_results(items, result)
        
    except Exception as e:
        print(f"Anthropic API error: {e}")
        raise


def cohere_categorize_and_dedupe(items: List[Item], api_key: str) -> List[Item]:
    """Use Cohere API to categorize and deduplicate items."""
    try:
        item_names = [item.name for item in items]
        
        prompt = f"""
You are a grocery list categorizer. Categorize these items into appropriate grocery store categories:

Items: {', '.join(item_names)}

Categories to choose from:
- Dairy & Eggs (milk, cheese, eggs, yogurt, butter, etc.)
- Produce (fruits, vegetables, herbs)
- Meat & Seafood (chicken, beef, fish, pork, etc.)
- Pantry (rice, pasta, bread, cereal, canned goods, etc.)
- Frozen (frozen foods, ice cream, frozen vegetables)
- Beverages (drinks, water, juice, coffee, tea, etc.)
- Bakery (fresh bread, pastries, cakes, etc.)
- Other (anything that doesn't fit the above categories)

Also identify any duplicate items that should be merged (e.g., "milk" and "1 gallon milk" should be merged).

Return a JSON response with this structure:
{{
    "categorized_items": [
        {{
            "name": "item name",
            "category": "category name",
            "merged_with": ["list of duplicate item names to merge with"]
        }}
    ]
}}

Only return the JSON, no other text.
"""
        
        response = requests.post(
            "https://api.cohere.ai/v1/generate",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "command",
                "prompt": prompt,
                "max_tokens": 1000,
                "temperature": 0.1
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Cohere API error: {response.status_code} - {response.text}")
        
        result = json.loads(response.json()["generations"][0]["text"])
        return process_llm_results(items, result)
        
    except Exception as e:
        print(f"Cohere API error: {e}")
        raise


def process_llm_results(items: List[Item], llm_result: Dict[str, Any]) -> List[Item]:
    """Process LLM results and apply categorization and deduplication."""
    # Create a mapping of original items by name
    items_by_name = {item.name: item for item in items}
    
    # Process categorized items from LLM
    processed_items = []
    processed_names = set()
    
    for llm_item in llm_result.get("categorized_items", []):
        item_name = llm_item["name"]
        category = llm_item["category"]
        merged_with = llm_item.get("merged_with", [])
        
        if item_name in items_by_name and item_name not in processed_names:
            # Get the original item
            original_item = items_by_name[item_name]
            original_item.category = category
            
            # Handle merging with other items
            for merge_name in merged_with:
                if merge_name in items_by_name and merge_name not in processed_names:
                    merge_item = items_by_name[merge_name]
                    # Merge quantities if both have them
                    if original_item.qty and merge_item.qty:
                        original_item.qty += merge_item.qty
                    elif merge_item.qty and not original_item.qty:
                        original_item.qty = merge_item.qty
                    
                    # Merge notes
                    if merge_item.notes and not original_item.notes:
                        original_item.notes = merge_item.notes
                    elif merge_item.notes and original_item.notes:
                        original_item.notes = f"{original_item.notes}, {merge_item.notes}"
                    
                    processed_names.add(merge_name)
            
            processed_items.append(original_item)
            processed_names.add(item_name)
    
    # Add any items that weren't processed by LLM
    for item in items:
        if item.name not in processed_names:
            item.category = "Other"  # Default category
            processed_items.append(item)
    
    # Sort by category and name
    processed_items.sort(key=lambda x: (x.category, x.name.lower()))
    
    return processed_items
