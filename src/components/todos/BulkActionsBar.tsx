/**
 * BulkActionsBar Component
 * 
 * A fixed action bar that appears at the bottom of the screen when multiple todos
 * are selected, providing bulk operations like moving, completing/uncompleting,
 * and deleting multiple todos at once.
 * 
 * @component
 * 
 * Key Features:
 * - Batch operations on multiple todos
 * - Folder movement with dropdown
 * - Bulk completion toggle
 * - Batch deletion
 * - Selection count display
 * 
 * Integration Points:
 * 1. Parent Component:
 *    - TodoList manages selection state
 *    - Provides callbacks for bulk operations
 * 
 * 2. Database:
 *    - Batch updates to todos table
 *    - Handles folder assignments
 *    - Manages completion status
 * 
 * 3. Related Components:
 *    - BulkSelectToggle enables selection mode
 *    - TodoItem shows selection checkboxes
 * 
 * Data Flow:
 * 1. Selection:
 *    - User selects multiple todos
 *    - Component receives selected IDs
 *    - Displays count and available actions
 * 
 * 2. Operations:
 *    - Move: Updates folder_id for selected todos
 *    - Complete: Toggles is_complete status
 *    - Delete: Removes selected todos
 * 
 * Performance Considerations:
 * - Uses batch database operations
 * - Optimistic UI updates
 * - Efficient state management
 */

import React, { useState } from 'react';
import { Folder, Trash2, CheckSquare } from 'lucide-react';
import type { Folder as FolderType } from '../../types/folder';
import type { Todo } from '../../types/todo';

interface BulkActionsBarProps {
  /** Number of currently selected todos */
  selectedCount: number;
  /** Available folders for moving todos */
  folders: FolderType[];
  /** All todos in the current view */
  todos: Todo[];
  /** Set of selected todo IDs */
  selectedTodos: Set<string>;
  /** Callback to move selected todos to a folder */
  onMoveToFolder: (folderId: string | null) => Promise<void>;
  /** Callback to delete selected todos */
  onDelete: () => Promise<void>;
  /** Callback to toggle completion status of selected todos */
  onToggleComplete: (complete: boolean) => Promise<void>;
  /** Callback to clear the current selection */
  onClearSelection: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  folders,
  todos,
  selectedTodos,
  onMoveToFolder,
  onDelete,
  onToggleComplete,
  onClearSelection,
}: BulkActionsBarProps) {
  // Track folder menu open state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Handles folder selection for moving todos
   * @param folderId - Target folder ID or null for root
   */
  const handleFolderSelect = (folderId: string | null) => {
    onMoveToFolder(folderId);
    setIsMenuOpen(false);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50"
      role="region"
      aria-label="Bulk actions"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
        {/* Selection info */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700"
            aria-label="Clear selection"
          >
            Clear selection
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Move to folder dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white border rounded-md hover:bg-gray-50 w-full sm:w-auto"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <Folder className="h-4 w-4" />
              <span>Move to folder</span>
            </button>
            {isMenuOpen && (
              <div 
                className="absolute bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1"
                role="menu"
              >
                <button
                  onClick={() => handleFolderSelect(null)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  No folder
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder.id)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle completion status */}
          <button
            onClick={() => onToggleComplete(!Array.from(selectedTodos).every(id => 
              todos.find(t => t.id === id)?.is_complete
            ))}
            className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-md hover:bg-gray-50"
            aria-label="Toggle completion status"
          >
            <CheckSquare className="h-4 w-4" />
            <span>
              Mark {Array.from(selectedTodos).every(id => 
                todos.find(t => t.id === id)?.is_complete
              ) ? 'incomplete' : 'complete'}
            </span>
          </button>

          {/* Delete selected */}
          <button
            onClick={onDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-md text-red-600 hover:bg-red-50"
            aria-label="Delete selected items"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import BulkActionsBar from './components/todos/BulkActionsBar';
 * import { useBulkActions } from './hooks/useBulkActions';
 * 
 * function TodoList() {
 *   const {
 *     selectedTodos,
 *     handleBulkMove,
 *     handleBulkDelete,
 *     handleBulkToggleComplete,
 *   } = useBulkActions(todos, setTodos);
 * 
 *   return (
 *     <>
 *       {selectedTodos.size > 0 && (
 *         <BulkActionsBar
 *           selectedCount={selectedTodos.size}
 *           todos={todos}
 *           selectedTodos={selectedTodos}
 *           folders={folders}
 *           onMoveToFolder={handleBulkMove}
 *           onDelete={handleBulkDelete}
 *           onToggleComplete={handleBulkToggleComplete}
 *           onClearSelection={() => setSelectedTodos(new Set())}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link useBulkActions} For the bulk operations hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link BulkSelectToggle} For the selection mode toggle
 */