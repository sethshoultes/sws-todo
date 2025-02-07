/**
 * DeleteFolderModal Component
 * 
 * A modal dialog component for safely deleting folders in the todo application.
 * This component handles the confirmation and deletion process for folders,
 * ensuring proper cleanup of associated todos.
 * 
 * @component
 * 
 * Integration Points:
 * - Connects with useFolders hook for folder deletion
 * - Used by TodoList page component
 * - Integrates with Supabase todo_folders and todos tables
 * 
 * Data Flow:
 * 1. Modal displays with folder information and confirmation message
 * 2. User confirms deletion
 * 3. useFolders hook handles:
 *    - Moving todos to root level (folder_id = null)
 *    - Deleting the folder from todo_folders table
 * 4. UI updates to reflect the deletion
 * 
 * Security:
 * - Folder deletion is protected by Supabase RLS policies
 * - Only folder owners can delete folders
 * - Shared users cannot delete folders
 * 
 * Database Impact:
 * - Updates todos table: Sets folder_id to null for affected todos
 * - Deletes record from todo_folders table
 */

import React from 'react';
import type { Folder } from '../../types/folder';

interface DeleteFolderModalProps {
  /** The folder to be deleted */
  folder: Folder;
  /** Callback function to handle folder deletion */
  onConfirm: (folder: Folder) => Promise<void>;
  /** Callback function to close the modal */
  onClose: () => void;
}

export default function DeleteFolderModal({ 
  folder, 
  onConfirm, 
  onClose 
}: DeleteFolderModalProps) {
  /**
   * Handles the form submission and folder deletion
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(folder);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="delete-folder-title"
      aria-describedby="delete-folder-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 
          id="delete-folder-title"
          className="text-lg font-semibold mb-4"
        >
          Delete Folder
        </h3>
        <p 
          id="delete-folder-description"
          className="text-gray-600 mb-4"
        >
          Are you sure you want to delete "{folder.name}"? This action cannot be undone.
          All todos in this folder will be moved to the root level.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              aria-label={`Delete folder ${folder.name}`}
            >
              Delete Folder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Cancel folder deletion"
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
 * import DeleteFolderModal from './components/folders/DeleteFolderModal';
 * import { useFolders } from './hooks/useFolders';
 * 
 * function ParentComponent() {
 *   const { deleteFolder } = useFolders();
 *   const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
 * 
 *   return (
 *     <>
 *       {folderToDelete && (
 *         <DeleteFolderModal
 *           folder={folderToDelete}
 *           onConfirm={deleteFolder}
 *           onClose={() => setFolderToDelete(null)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link useFolders} For the folder management hook
 * @see {@link TodoList} For the parent component implementation
 */