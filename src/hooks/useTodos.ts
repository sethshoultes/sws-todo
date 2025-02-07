/**
 * useTodos Hook
 * 
 * A comprehensive hook that manages todo operations in the application.
 * Handles CRUD operations, real-time updates, and data synchronization
 * with Supabase backend.
 * 
 * @hook
 * 
 * Key Features:
 * - Todo CRUD operations
 * - Real-time updates
 * - Optimistic updates
 * - Error handling with rollback
 * - Loading state management
 * - Folder organization
 * - Sharing capabilities
 * 
 * Integration Points:
 * 1. Database:
 *    - todos table operations
 *    - Real-time subscriptions
 *    - RLS policy compliance
 *    - Sharing permissions
 * 
 * 2. Authentication:
 *    - User context integration
 *    - Permission validation
 *    - Access control
 * 
 * 3. Related Components:
 *    - TodoList for display
 *    - TodoForm for creation
 *    - TodoItem for individual items
 *    - EditTodoModal for updates
 * 
 * Data Flow:
 * 1. Initial Load:
 *    - Fetch user's todos
 *    - Fetch shared todos
 *    - Subscribe to changes
 * 
 * 2. Operations:
 *    - Create/Update/Delete todos
 *    - Toggle completion
 *    - Handle folder assignments
 * 
 * 3. Real-time Updates:
 *    - Subscribe to changes
 *    - Update local state
 *    - Notify components
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert } from '../types/todo';

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch todos and set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      console.log('Fetching todos for user:', user.id);

      // Fetch todos owned by the user
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id);

      console.log('Owned todos:', data);

      if (error) {
        console.error('Error fetching owned todos:', error);
        toast.error('Failed to fetch todos');
        return;
      }

      // Fetch todos shared with the user
      console.log('Fetching shared todos for user:', user.id);

      const { data: sharedTodos, error: sharedError } = await supabase
        .from('todos')
        .select('*')
        .contains('shared_with', [user.id]);

      console.log('Shared todos:', sharedTodos);

      if (sharedError) {
        console.error('Error fetching shared todos:', sharedError);
        toast.error('Failed to fetch shared todos');
        return;
      }

      // Combine and deduplicate todos
      const allTodos = [...(data || []), ...(sharedTodos || [])];
      console.log('Combined todos:', allTodos);
      
      const uniqueTodos = allTodos.filter((todo, index, self) =>
        index === self.findIndex((t) => t.id === todo.id)
      );

      console.log('Final unique todos:', uniqueTodos);
      setTodos(uniqueTodos);
      setLoading(false);
    };

    fetchTodos();

    // Set up real-time subscription
    const subscription = supabase
      .channel('todos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          or: [
            { column: 'user_id', eq: user.id },
            { column: 'shared_with', contains: [user.id] }
          ]
        },
        (payload) => {
          if (payload.new) {
            setTodos((current) => {
              const exists = current.find((todo) => todo.id === payload.new.id);
              if (exists) {
                return current.map((todo) =>
                  todo.id === payload.new.id ? payload.new : todo
                );
              }
              return [...current, payload.new];
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  /**
   * Creates a new todo with inherited folder permissions
   * @param todoData - The todo data excluding user_id
   */
  const addTodo = useCallback(async (todoData: Omit<TodoInsert, 'user_id'>) => {
    if (!user) return;
    
    let sharedWith: string[] = [];
    let canEdit: string[] = [];

    // Inherit folder sharing permissions if assigned to a folder
    if (todoData.folder_id) {
      const { data: folder } = await supabase
        .from('todo_folders')
        .select('shared_with, can_edit')
        .eq('id', todoData.folder_id)
        .single();

      if (folder) {
        sharedWith = folder.shared_with || [];
        canEdit = folder.can_edit || [];
      }
    }
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          ...todoData,
          user_id: user.id,
          shared_with: sharedWith,
          can_edit: canEdit
        })
        .select();

      if (error) throw error;
      if (data) {
        setTodos(current => [...current, data[0]]);
      }
      toast.success('Todo added successfully!');
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast.error('Failed to add todo');
    }
  }, [user]);

  /**
   * Toggles a todo's completion status
   * @param todo - The todo to toggle
   */
  const toggleTodo = useCallback(async (todo: Todo) => {
    // Optimistic update
    setTodos(current =>
      current.map(t =>
        t.id === todo.id ? { ...t, is_complete: !t.is_complete } : t
      )
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !todo.is_complete })
        .eq('id', todo.id);

      if (error) {
        // Rollback on error
        setTodos(current =>
          current.map(t =>
            t.id === todo.id ? { ...t, is_complete: todo.is_complete } : t
          )
        );
        throw error;
      }
    } catch (error) {
      toast.error('Failed to update todo');
    }
  }, []);

  /**
   * Deletes a todo
   * @param id - ID of the todo to delete
   */
  const deleteTodo = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      setTodos((current) => current.filter((todo) => todo.id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  }, []);

  /**
   * Updates a todo's properties
   * @param todo - The todo with updated values
   */
  const updateTodo = useCallback(async (todo: Todo) => {
    // Optimistic update
    setTodos(current =>
      current.map(t =>
        t.id === todo.id ? todo : t
      )
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({
          title: todo.title,
          description: todo.description,
          folder_id: todo.folder_id
        })
        .eq('id', todo.id);

      if (error) {
        // Rollback on error
        setTodos(current =>
          current.map(t =>
            t.id === todo.id ? { ...t, folder_id: t.folder_id } : t
          )
        );
        throw error;
      }
      toast.success('Todo updated successfully!');
    } catch (error) {
      toast.error('Failed to update todo');
    }
  }, []);

  return {
    todos,
    setTodos,
    loading,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
  };
}

/**
 * Hook Usage Example:
 * 
 * ```tsx
 * import { useTodos } from '../hooks/useTodos';
 * 
 * function TodoList() {
 *   const {
 *     todos,
 *     loading,
 *     addTodo,
 *     toggleTodo,
 *     deleteTodo,
 *     updateTodo
 *   } = useTodos();
 * 
 *   if (loading) {
 *     return <div>Loading todos...</div>;
 *   }
 * 
 *   return (
 *     <div>
 *       <TodoForm onSubmit={addTodo} />
 *       {todos.map((todo) => (
 *         <TodoItem
 *           key={todo.id}
 *           todo={todo}
 *           onToggle={toggleTodo}
 *           onDelete={deleteTodo}
 *           onEdit={(todo) => setEditingTodo(todo)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link TodoList} For the parent component implementation
 * @see {@link TodoForm} For todo creation
 * @see {@link TodoItem} For individual todo display
 * @see {@link EditTodoModal} For todo editing
 */