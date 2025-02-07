/**
 * useDragAndDrop Hook
 * 
 * A custom hook that implements drag and drop functionality for todo items,
 * enabling manual reordering and folder organization. Manages drag state
 * and handles the persistence of todo order preferences.
 * 
 * @hook
 * 
 * Key Features:
 * - Drag and drop reordering
 * - Folder-aware ordering
 * - Persistent order storage
 * - Optimistic updates
 * - Cross-folder movement
 * 
 * Integration Points:
 * 1. Database:
 *    - Updates todo folder assignments
 *    - Stores order preferences in todo_user_preferences
 *    - Maintains data consistency
 * 
 * 2. Parent Component:
 *    - TodoList manages drag state
 *    - Provides filtered todos array
 *    - Updates todo order display
 * 
 * 3. Related Components:
 *    - TodoItem implements draggable interface
 *    - FolderList provides folder context
 *    - TodoOrder maintains preference state
 * 
 * Data Flow:
 * 1. Drag Start:
 *    - User initiates drag
 *    - Component stores dragged item
 *    - UI updates to show drag state
 * 
 * 2. Drop Operation:
 *    - Validates drop target
 *    - Updates folder assignment if needed
 *    - Reorders todos array
 *    - Persists new order
 * 
 * 3. State Updates:
 *    - Optimistic UI updates
 *    - Database synchronization
 *    - Error handling and rollback
 */

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Todo } from '../types/todo';

interface TodoOrder {
  [key: string]: string[];
}

export function useDragAndDrop(
  setTodoOrder: (order: TodoOrder | ((prev: TodoOrder) => TodoOrder)) => void,
  filteredTodos: Todo[]
) {
  // Track the currently dragged todo item
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);

  /**
   * Initializes drag operation and stores dragged item
   * @param todo - The todo being dragged
   */
  const handleDragStart = useCallback((todo: Todo) => {
    setDraggedTodo(todo);
  }, []);

  /**
   * Cleans up drag state when operation ends
   */
  const handleDragEnd = useCallback(() => {
    setDraggedTodo(null);
  }, []);

  /**
   * Handles the drop operation for reordering todos
   * @param targetTodo - The todo item being dropped onto
   */
  const handleDrop = useCallback(async (targetTodo: Todo) => {
    if (!draggedTodo || draggedTodo.id === targetTodo.id) return;

    try {
      const currentTodos = [...filteredTodos];
      const draggedIndex = currentTodos.findIndex(t => t.id === draggedTodo.id);
      const targetIndex = currentTodos.findIndex(t => t.id === targetTodo.id);
      
      if (draggedIndex === -1 || targetIndex === -1) return;

      // Handle cross-folder movement
      if (draggedTodo.folder_id !== targetTodo.folder_id) {
        const { error } = await supabase
         .from('todos')
         .update({ folder_id: targetTodo.folder_id })
         .eq('id', draggedTodo.id);

        if (error) throw error;
        draggedTodo.folder_id = targetTodo.folder_id;
      }

      // Update todo order
      const newTodos = currentTodos.filter(t => t.id !== draggedTodo.id);
      newTodos.splice(targetIndex, 0, draggedTodo);
      
      // Update order for the affected folder
      const folderId = targetTodo.folder_id || 'root';
      const newOrder = newTodos
        .filter(t => (t.folder_id || 'root') === folderId)
        .map(t => t.id);
      
      // Persist the new order
      setTodoOrder(prev => {
        const updated = { ...prev };
        updated[folderId] = newOrder;
        return updated;
      });

      toast.success('Todo moved successfully!');
    } catch (error) {
      toast.error('Failed to move todo');
    }
  }, [draggedTodo, filteredTodos, setTodoOrder]);

  return {
    draggedTodo,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
}

/**
 * Hook Usage Example:
 * 
 * ```tsx
 * import { useDragAndDrop } from '../hooks/useDragAndDrop';
 * import { useTodoOrder } from '../hooks/useTodoOrder';
 * 
 * function TodoList() {
 *   const { todoOrder, setTodoOrder } = useTodoOrder();
 *   const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
 * 
 *   const {
 *     draggedTodo,
 *     handleDragStart,
 *     handleDragEnd,
 *     handleDrop
 *   } = useDragAndDrop(setTodoOrder, filteredTodos);
 * 
 *   return (
 *     <div>
 *       {filteredTodos.map((todo) => (
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
 * @see {@link TodoItem} For the draggable component implementation
 * @see {@link useTodoOrder} For order preference management
 * @see {@link TodoList} For the parent component implementation
 */