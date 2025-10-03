#!/usr/bin/env python3
"""
Test script to demonstrate LLM-powered categorization.
Run this to see the difference between rules-based and LLM-based categorization.
"""

import os
import sys
sys.path.append('apps/api')

from apps.api.llm import llm_categorize_and_dedupe, categorize_and_dedupe
from apps.api.models import Item

def test_categorization():
    """Test both rules-based and LLM-based categorization."""
    
    # Test items with various complexities
    test_items = [
        "eggs",
        "organic free-range eggs", 
        "2 dozen eggs",
        "egg whites",
        "quinoa",
        "fresh basil",
        "frozen pizza",
        "almond milk",
        "Greek yogurt",
        "whole wheat bread"
    ]
    
    # Create Item objects
    items = []
    for i, name in enumerate(test_items):
        item = Item(
            id=str(i+1),
            name=name,
            category="Other",
            checked=False,
            spaceId="default",
            rawText=name,
            createdAt="2024-01-01T00:00:00",
            updatedAt="2024-01-01T00:00:00"
        )
        items.append(item)
    
    print("🧪 Testing Categorization Methods")
    print("=" * 50)
    
    # Test rules-based categorization
    print("\n📋 Rules-Based Categorization:")
    rules_result = categorize_and_dedupe(items.copy())
    for item in rules_result:
        print(f"  {item.name:<25} -> {item.category}")
    
    # Test LLM-based categorization (if API key is available)
    llm_provider = os.getenv("LLM_PROVIDER")
    llm_api_key = os.getenv("LLM_API_KEY")
    
    if llm_provider and llm_api_key and llm_api_key != "your_api_key_here":
        print(f"\n🤖 LLM-Based Categorization ({llm_provider}):")
        try:
            llm_result = llm_categorize_and_dedupe(items.copy())
            for item in llm_result:
                print(f"  {item.name:<25} -> {item.category}")
        except Exception as e:
            print(f"  ❌ LLM categorization failed: {e}")
            print("  🔄 Falling back to rules-based approach")
    else:
        print(f"\n🤖 LLM-Based Categorization:")
        print("  ⚠️  No LLM API key configured")
        print("  💡 Set LLM_PROVIDER and LLM_API_KEY environment variables to test LLM categorization")
        print("  📖 See LLM_SETUP.md for configuration instructions")

if __name__ == "__main__":
    test_categorization()
