/**
 * EditTodoModal Component
 * 
 * A modal dialog component for editing existing todo items. Provides a form interface
 * for modifying todo properties and handles the update process through the Supabase
 * database.
 * 
 * @component
 * 
 * Key Features:
 * - Edit todo title and description
 * - Change folder assignment
 * - Form validation
 * - Optimistic updates
 * - Accessible form controls
 * 
 * Integration Points:
 * 1. Database:
 *    - Updates todos table in Supabase
 *    - Respects folder permissions
 *    - Maintains sharing settings
 * 
 * 2. Parent Components:
 *    - TodoList manages edit state
 *    - useTodos hook handles updates
 * 
 * 3. Related Components:
 *    - TodoItem triggers edit mode
 *    - FolderList provides folder options
 * 
 * Data Flow:
 * 1. Receives existing todo data
 * 2. User modifies fields
 * 3. On submit:
 *    - Validates input
 *    - Updates database
 *    - Updates local state
 *    - Closes modal
 * 
 * Security:
 * - Protected by RLS policies
 * - Respects user permissions
 * - Maintains data integrity
 */

import { useState } from 'react';
import { Database } from '../../types/supabase';
import type { Folder } from '../../types/folder';

/**
 * Type definition for a todo item
 */
type Todo = Database['public']['Tables']['todos']['Row'];

/**
 * Props for EditTodoModal component
 */
interface EditTodoModalProps {
  /** Todo being edited */
  todo: Todo;
  /** Available folders for todo organization */
  folders: Folder[];
  /** Currently selected folder */
  selectedFolderId: string | null;
  /** Callback to save changes */
  onSave: (todo: Todo) => Promise<void>;
  /** Callback to close modal */
  onClose: () => void;
}

export default function EditTodoModal({ 
  todo, 
  folders, 
  selectedFolderId, 
  onSave, 
  onClose 
}: EditTodoModalProps) {
  // Form state
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [folderId, setFolderId] = useState<string | null>(todo.folder_id);

  /**
   * Handles form submission and todo update
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...todo,
      title,
      description,
      folder_id: folderId,
      // Preserve other fields
      created_at: todo.created_at,
      is_complete: todo.is_complete,
      user_id: todo.user_id,
      shared_with: todo.shared_with,
      can_edit: todo.can_edit
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="edit-todo-title"
      aria-describedby="edit-todo-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 
          id="edit-todo-title"
          className="text-lg font-semibold mb-4"
        >
          Edit Todo
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            aria-label="Todo title"
            aria-required="true"
          />

          {/* Description textarea */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            aria-label="Todo description"
          />

          {/* Folder selection */}
          <div>
            <label 
              htmlFor="folder" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Folder
            </label>
            <select
              id="folder"
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-label="Select folder"
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex-1"
              aria-label="Save changes"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors duration-200"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import EditTodoModal from './components/todos/EditTodoModal';
 * import { useTodos } from './hooks/useTodos';
 * 
 * function TodoList() {
 *   const { updateTodo } = useTodos();
 *   const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
 * 
 *   return (
 *     <>
 *       {editingTodo && (
 *         <EditTodoModal
 *           todo={editingTodo}
 *           folders={folders}
 *           selectedFolderId={selectedFolderId}
 *           onSave={updateTodo}
 *           onClose={() => setEditingTodo(null)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link useTodos} For the todo management hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link TodoItem} For the component that triggers editing
 */