import React, { useState } from 'react';

interface QuickAddProps {
  onAddItem: (text: string) => void;
}

export function QuickAdd({ onAddItem }: QuickAddProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await onAddItem(text.trim());
      setText('');
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="quick-add">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add an item to your grocery list..."
            disabled={loading}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={!text.trim() || loading}
            className="add-button"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
