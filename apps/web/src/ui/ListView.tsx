import React from 'react';
import { Item } from '../types';

interface ListViewProps {
  itemsByCategory: Record<string, Item[]>;
  sortedCategories: string[];
}

export function ListView({ itemsByCategory, sortedCategories }: ListViewProps) {
  if (sortedCategories.length === 0) {
    return (
      <div className="list-view">
        <div className="empty-state">
          <p>Your grocery list is empty.</p>
          <p>Add some items above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="list-view">
      {sortedCategories.map(category => (
        <Section 
          key={category}
          title={category}
          items={itemsByCategory[category]}
        />
      ))}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: Item[];
}

function Section({ title, items }: SectionProps) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      <div className="items">
        {items.map(item => (
          <ItemComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface ItemComponentProps {
  item: Item;
}

function ItemComponent({ item }: ItemComponentProps) {
  const displayName = item.name;
  const displayQty = item.qty ? `${item.qty}${item.unit ? ` ${item.unit}` : ''}` : '';
  const displayText = displayQty ? `${displayQty} ${displayName}` : displayName;

  return (
    <div className={`item ${item.checked ? 'checked' : ''}`}>
      <div className="item-content">
        <span className="item-text">{displayText}</span>
        {item.notes && (
          <span className="item-notes">{item.notes}</span>
        )}
      </div>
      <div className="item-actions">
        <input 
          type="checkbox" 
          checked={item.checked}
          readOnly
          className="item-checkbox"
        />
      </div>
    </div>
  );
}
