/**
 * TodoForm Component
 * 
 * A form component for creating new todo items with support for titles,
 * descriptions, and folder organization. Features an expandable interface
 * that reveals additional fields when needed.
 * 
 * @component
 * 
 * Key Features:
 * - Expandable form interface
 * - Required title field
 * - Optional description field
 * - Folder selection dropdown
 * - Form validation
 * - Responsive design
 * - Accessible form controls
 * 
 * Integration Points:
 * 1. Database:
 *    - Creates new records in todos table
 *    - Inherits folder sharing permissions
 *    - Maintains data consistency
 * 
 * 2. Parent Component:
 *    - TodoList manages form state
 *    - Provides folder data
 *    - Handles todo creation
 * 
 * 3. Related Components:
 *    - FolderList provides folder context
 *    - TodoItem displays created todos
 * 
 * Data Flow:
 * 1. User Input:
 *    - Enters todo details
 *    - Selects folder (optional)
 *    - Submits form
 * 
 * 2. Validation:
 *    - Checks required fields
 *    - Validates input formats
 * 
 * 3. Submission:
 *    - Calls onSubmit callback
 *    - Clears form on success
 *    - Collapses expanded view
 * 
 * State Management:
 * - Local state for form fields
 * - Expansion state for UI
 * - Folder selection state
 */

import { useState, useRef } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Database } from '../../types/supabase';
import type { Folder } from '../../types/folder';

/**
 * Type for inserting a new todo, excluding user_id which is added by the parent
 */
type TodoInsert = Omit<Database['public']['Tables']['todos']['Insert'], 'user_id'>;

/**
 * Props for TodoForm component
 * @property onSubmit - Callback function to handle form submission
 * @property folders - Available folders for todo organization
 * @property selectedFolderId - Currently selected folder
 */
interface TodoFormProps {
  onSubmit: (todo: TodoInsert) => Promise<void>;
  folders: Folder[];
  selectedFolderId: string | null;
}

export default function TodoForm({ onSubmit, folders, selectedFolderId }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(selectedFolderId);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Handles form submission and resets form state
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      description, 
      folder_id: folderId 
    });
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="todo-form"
      >
        <span className="text-lg font-semibold text-gray-900">Add New Task</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>

      <form
        ref={formRef}
        id="todo-form"
        onSubmit={handleSubmit}
        className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a task title..."
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              aria-label="Task title"
              aria-required="true"
            />
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task (optional)"
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              aria-label="Task description"
            />
          </div>
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
          <button
            type="submit"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            aria-label="Add new task"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import TodoForm from './components/todos/TodoForm';
 * import { useTodos } from '../../hooks/useTodos';
 * 
 * function TodoList() {
 *   const { addTodo } = useTodos();
 *   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
 * 
 *   return (
 *     <TodoForm
 *       onSubmit={addTodo}
 *       folders={folders}
 *       selectedFolderId={selectedFolderId}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link useTodos} For the todo management hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link FolderList} For folder selection integration
 */