/**
 * useBulkActions Hook
 * 
 * A custom hook that manages bulk operations on todos, including selection,
 * moving to folders, deletion, and completion status updates. Provides
 * optimistic updates with error handling and rollback capabilities.
 * 
 * @hook
 * 
 * Key Features:
 * - Multi-todo selection management
 * - Batch operations (move, delete, toggle)
 * - Optimistic UI updates
 * - Error handling with rollback
 * - Selection mode toggle
 * 
 * Integration Points:
 * 1. Database:
 *    - Batch updates to todos table
 *    - Folder assignments
 *    - Deletion operations
 *    - Status updates
 * 
 * 2. Parent Component:
 *    - TodoList manages selection state
 *    - Controls bulk action visibility
 *    - Handles operation feedback
 * 
 * 3. Related Components:
 *    - BulkActionsBar shows available actions
 *    - TodoItem displays selection state
 *    - BulkSelectToggle enables selection mode
 * 
 * Data Flow:
 * 1. Selection:
 *    - User enables selection mode
 *    - Selects multiple todos
 *    - Selection state updates
 * 
 * 2. Operations:
 *    - User initiates bulk action
 *    - Optimistic UI update
 *    - Database operation
 *    - Success/error handling
 * 
 * Error Handling:
 * - Optimistic updates with rollback
 * - Toast notifications
 * - State recovery
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Todo } from '../types/todo';

export function useBulkActions(todos: Todo[], setTodos: (todos: Todo[]) => void) {
  // Selection state
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showBulkSelect, setShowBulkSelect] = useState(false);

  // Update selection mode when todos are selected/deselected
  useEffect(() => {
    setSelectionMode(selectedTodos.size > 0);
  }, [selectedTodos]);

  /**
   * Moves selected todos to a specified folder
   * @param folderId - Target folder ID or null for root
   */
  const handleBulkMove = useCallback(async (folderId: string | null) => {
    try {
      // Optimistically update UI
      setTodos(current =>
        current.map(todo =>
          selectedTodos.has(todo.id)
            ? { ...todo, folder_id: folderId }
            : todo
        )
      );

      // Perform database update
      const { error } = await supabase
        .from('todos')
        .update({ folder_id: folderId })
        .in('id', Array.from(selectedTodos));

      if (error) {
        // Rollback on error
        setTodos(current =>
          current.map(todo =>
            selectedTodos.has(todo.id)
              ? { ...todo, folder_id: todo.folder_id }
              : todo
          )
        );
        throw error;
      }

      toast.success('Todos moved successfully!');
      setSelectedTodos(new Set());
    } catch (error) {
      toast.error('Failed to move todos');
    }
  }, [selectedTodos, setTodos]);

  /**
   * Deletes selected todos
   */
  const handleBulkDelete = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .in('id', Array.from(selectedTodos));

      if (error) throw error;
      toast.success('Todos deleted successfully!');
      setSelectedTodos(new Set());
    } catch (error) {
      toast.error('Failed to delete todos');
    }
  }, [selectedTodos]);

  /**
   * Toggles completion status for selected todos
   * @param complete - Target completion status
   */
  const handleBulkToggleComplete = useCallback(async (complete: boolean) => {
    try {
      // Optimistically update UI
      setTodos(current =>
        current.map(todo =>
          selectedTodos.has(todo.id)
            ? { ...todo, is_complete: complete }
            : todo
        )
      );

      // Perform database update
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: complete })
        .in('id', Array.from(selectedTodos));

      if (error) {
        // Rollback on error
        setTodos(current =>
          current.map(todo =>
            selectedTodos.has(todo.id)
              ? { ...todo, is_complete: !complete }
              : todo
          )
        );
        throw error;
      }

      toast.success('Todos updated successfully!');
      setSelectedTodos(new Set());
    } catch (error) {
      toast.error('Failed to update todos');
    }
  }, [selectedTodos, setTodos]);

  return {
    selectedTodos,
    setSelectedTodos,
    selectionMode,
    showBulkSelect,
    setShowBulkSelect,
    handleBulkMove,
    handleBulkDelete,
    handleBulkToggleComplete,
  };
}

/**
 * Hook Usage Example:
 * 
 * ```tsx
 * import { useBulkActions } from '../hooks/useBulkActions';
 * import { useTodos } from '../hooks/useTodos';
 * 
 * function TodoList() {
 *   const { todos, setTodos } = useTodos();
 *   const {
 *     selectedTodos,
 *     selectionMode,
 *     showBulkSelect,
 *     setShowBulkSelect,
 *     handleBulkMove,
 *     handleBulkDelete,
 *     handleBulkToggleComplete,
 *   } = useBulkActions(todos, setTodos);
 * 
 *   return (
 *     <>
 *       <BulkSelectToggle
 *         isEnabled={showBulkSelect}
 *         onToggle={setShowBulkSelect}
 *       />
 *       
 *       {selectionMode && (
 *         <BulkActionsBar
 *           selectedCount={selectedTodos.size}
 *           onMove={handleBulkMove}
 *           onDelete={handleBulkDelete}
 *           onToggleComplete={handleBulkToggleComplete}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link BulkActionsBar} For the bulk actions UI
 * @see {@link BulkSelectToggle} For selection mode toggle
 * @see {@link TodoItem} For individual item selection
 */