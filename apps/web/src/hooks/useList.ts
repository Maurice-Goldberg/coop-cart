import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types';
import { getItems, setItems, addItem, updateItem, removeItem } from '../db';

export function useList(spaceId: string) {
  const [items, setItemsState] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const dbItems = await getItems(spaceId);
      setItemsState(dbItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  const addItemToDb = useCallback(async (item: Item) => {
    try {
      await addItem(item);
      setItemsState(prev => [...prev, item]);
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  }, []);

  const updateItemInDb = useCallback(async (id: string, updates: Partial<Item>) => {
    try {
      await updateItem(id, updates);
      setItemsState(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  }, []);

  const removeItemFromDb = useCallback(async (id: string) => {
    try {
      await removeItem(id);
      setItemsState(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }, []);

  const replaceItems = useCallback(async (newItems: Item[]) => {
    try {
      await setItems(newItems);
      setItemsState(newItems);
    } catch (error) {
      console.error('Failed to replace items:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    addItem: addItemToDb,
    updateItem: updateItemInDb,
    removeItem: removeItemFromDb,
    replaceItems,
    refresh: loadItems,
  };
}
