import { Item } from '../types';

interface ListViewProps {
  itemsByCategory: Record<string, Item[]>;
  sortedCategories: string[];
  onToggleItem: (id: string) => void;
}

export function ListView({ itemsByCategory, sortedCategories, onToggleItem }: ListViewProps) {
  if (sortedCategories.length === 0) {
    return (
      <div className="glass rounded-2xl overflow-hidden shadow-soft-md border border-white/30 relative">
        <div className="py-16 px-8 text-center text-neutral-600">
          <p className="mb-2 text-fluid-base">Your grocery list is empty.</p>
          <p className="text-fluid-base">Add some items above to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-soft-md border border-white/30 relative">
      {sortedCategories.map(category => (
        <Section 
          key={category}
          title={category}
          items={itemsByCategory[category]}
          onToggleItem={onToggleItem}
        />
      ))}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: Item[];
  onToggleItem: (id: string) => void;
}

function Section({ title, items, onToggleItem }: SectionProps) {
  return (
    <div className="border-b border-white/30 last:border-b-0">
      <h3 className="px-6 py-4 glass-light text-fluid-sm font-semibold text-neutral-800 uppercase tracking-wide m-0">
        {title}
      </h3>
      <div className="divide-y divide-white/20">
        {items.map(item => (
          <ItemComponent key={item.id} item={item} onToggleItem={onToggleItem} />
        ))}
      </div>
    </div>
  );
}

interface ItemComponentProps {
  item: Item;
  onToggleItem: (id: string) => void;
}

function ItemComponent({ item, onToggleItem }: ItemComponentProps) {
  const displayName = item.name;
  const displayQty = item.qty ? `${item.qty}${item.unit ? ` ${item.unit}` : ''}` : '';
  const displayText = displayQty ? `${displayQty} ${displayName}` : displayName;

  return (
    <div className={`flex items-center px-6 py-4 transition-all duration-220 hover:bg-white/15 hover:backdrop-blur-sm motion-safe-hover-raise relative ${
      item.checked ? 'opacity-60 bg-primary-500/5' : ''
    }`}>
      <div className="flex-1 flex flex-col gap-1">
        <span className={`font-medium text-neutral-800 text-fluid-base ${
          item.checked ? 'line-through' : ''
        }`}>
          {displayText}
        </span>
        {item.notes && (
          <span className="text-fluid-sm text-neutral-500 italic">{item.notes}</span>
        )}
      </div>
      <div className="ml-4 flex-shrink-0">
        <input 
          type="checkbox" 
          checked={item.checked}
          onChange={() => onToggleItem(item.id)}
          className="w-5 h-5 cursor-pointer accent-primary-500"
        />
      </div>
    </div>
  );
}
