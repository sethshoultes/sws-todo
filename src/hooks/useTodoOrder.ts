/**
 * useTodoOrder Hook
 * 
 * A custom hook that manages the persistent ordering of todos within folders.
 * Handles loading, saving, and updating todo order preferences in the database,
 * with debounced updates to prevent excessive database operations.
 * 
 * @hook
 * 
 * Key Features:
 * - Persistent todo ordering
 * - Folder-specific ordering
 * - Debounced preference updates
 * - Real-time state management
 * - Automatic preference loading
 * 
 * Integration Points:
 * 1. Database:
 *    - todo_user_preferences table operations
 *    - Preference serialization
 *    - Optimized updates
 * 
 * 2. Parent Component:
 *    - TodoList uses order for display
 *    - Drag and drop updates order
 *    - Maintains todo sequence
 * 
 * 3. Related Components:
 *    - TodoItem implements drag interface
 *    - FolderList provides context
 *    - useDragAndDrop manages reordering
 * 
 * Data Flow:
 * 1. Initial Load:
 *    - Fetch user preferences
 *    - Parse todo order data
 *    - Set initial state
 * 
 * 2. Order Updates:
 *    - Receive new order
 *    - Update local state
 *    - Debounce database update
 * 
 * 3. Persistence:
 *    - Serialize order data
 *    - Update preferences
 *    - Handle errors
 */

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useTodoOrder() {
  const { user } = useAuth();
  const [todoOrder, setTodoOrder] = useState<Record<string | 'root', string[]>>({});

  // Load saved preferences on mount
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from('todo_user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load preferences:', error);
        return;
      }

      if (data?.preferences?.todoOrder) {
        setTodoOrder(data.preferences.todoOrder);
      }
    };

    loadPreferences();
  }, [user]);

  /**
   * Debounced function to save todo order preferences
   * Prevents excessive database updates during rapid changes
   */
  const saveTodoOrder = useCallback(
    debounce(async (newOrder: Record<string | 'root', string[]>) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from('todo_user_preferences')
          .upsert({
            user_id: user.id,
            preferences: { todoOrder: newOrder }
          });

        if (error) throw error;
      } catch (error) {
        console.error('Failed to save todo order:', error);
      }
    }, 1000),
    [user]
  );

  // Save preferences when order changes
  useEffect(() => {
    if (Object.keys(todoOrder).length > 0) {
      saveTodoOrder(todoOrder);
    }
  }, [todoOrder, saveTodoOrder]);

  return {
    todoOrder,
    setTodoOrder,
  };
}

/**
 * Hook Usage Example:
 * 
 * ```tsx
 * import { useTodoOrder } from '../hooks/useTodoOrder';
 * import { useDragAndDrop } from '../hooks/useDragAndDrop';
 * 
 * function TodoList() {
 *   const { todoOrder, setTodoOrder } = useTodoOrder();
 *   const { handleDragStart, handleDragEnd, handleDrop } = useDragAndDrop(
 *     setTodoOrder,
 *     filteredTodos
 *   );
 * 
 *   // Sort todos based on saved order
 *   const sortedTodos = todos.sort((a, b) => {
 *     const folderId = selectedFolderId || 'root';
 *     const order = todoOrder[folderId] || [];
 *     const indexA = order.indexOf(a.id);
 *     const indexB = order.indexOf(b.id);
 *     
 *     if (indexA === -1 && indexB === -1) return 0;
 *     if (indexA === -1) return 1;
 *     if (indexB === -1) return -1;
 *     return indexA - indexB;
 *   });
 * 
 *   return (
 *     <div>
 *       {sortedTodos.map((todo) => (
 *         <TodoItem
 *           key={todo.id}
 *           todo={todo}
 *           onDragStart={handleDragStart}
 *           onDragEnd={handleDragEnd}
 *           onDrop={handleDrop}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link useDragAndDrop} For drag and drop functionality
 * @see {@link TodoList} For the parent component implementation
 * @see {@link TodoItem} For the draggable component
 */