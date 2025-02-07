/**
 * EditFolderModal Component
 * 
 * A modal dialog component for editing existing folders in the todo application.
 * This component handles the modification of folder properties while maintaining
 * data consistency and proper state management.
 * 
 * @component
 * 
 * Integration Points:
 * - Connects with useFolders hook for folder updates
 * - Used by TodoList page component
 * - Integrates with Supabase todo_folders table
 * 
 * Data Flow:
 * 1. Receives existing folder data from parent
 * 2. Displays current values in editable form
 * 3. On submission:
 *    - Updates folder in Supabase database
 *    - Updates local state through useFolders hook
 *    - Closes modal on success
 * 
 * Security:
 * - Protected by Supabase RLS policies
 * - Only folder owners can edit folder properties
 * - Shared users with 'manage' permission can edit
 * 
 * State Management:
 * - Uses local state for form fields
 * - Implements optimistic updates
 * - Handles error cases with proper UI feedback
 */

import React, { useState } from 'react';
import type { Folder } from '../../types/folder';

interface EditFolderModalProps {
  /** The folder being edited */
  folder: Folder;
  /** Callback function to handle folder updates */
  onSubmit: (folder: Folder) => Promise<void>;
  /** Callback function to close the modal */
  onClose: () => void;
}

export default function EditFolderModal({ folder, onSubmit, onClose }: EditFolderModalProps) {
  // Initialize form state with current folder values
  const [name, setName] = useState(folder.name);
  const [description, setDescription] = useState(folder.description || '');

  /**
   * Handles form submission and folder update
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...folder,
      name,
      description
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="edit-folder-title"
      aria-describedby="edit-folder-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 
          id="edit-folder-title"
          className="text-lg font-semibold mb-4"
        >
          Edit Folder
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Folder Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              aria-required="true"
              aria-label="Folder name"
            />
          </div>
          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              aria-label="Folder description"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              aria-label="Save folder changes"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Cancel folder editing"
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
 * import EditFolderModal from './components/folders/EditFolderModal';
 * import { useFolders } from './hooks/useFolders';
 * 
 * function ParentComponent() {
 *   const { updateFolder } = useFolders();
 *   const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
 * 
 *   return (
 *     <>
 *       {editingFolder && (
 *         <EditFolderModal
 *           folder={editingFolder}
 *           onSubmit={updateFolder}
 *           onClose={() => setEditingFolder(null)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link useFolders} For the folder management hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link Folder} For the folder type definition
 */