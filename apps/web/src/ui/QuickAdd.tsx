import { useState } from 'react';

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
    // Prevent newlines from being typed
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any newlines that might be pasted
    const value = e.target.value.replace(/[\r\n]/g, '');
    setText(value);
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 glass-gradient rounded-xl p-3 shadow-soft border border-white/30 relative overflow-hidden">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Add an item to your grocery list..."
            disabled={loading}
            autoFocus
            className="flex-1 input-glass"
          />
          <button 
            type="submit" 
            disabled={!text.trim() || loading}
            className="px-4 py-3 btn-primary"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
