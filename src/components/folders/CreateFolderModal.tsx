/**
 * CreateFolderModal Component
 * 
 * A modal dialog component for creating new folders in the todo application.
 * This component is part of the folder management system and integrates with
 * the Supabase backend through the useFolders hook.
 * 
 * @component
 * 
 * Integration Points:
 * - Connects with useFolders hook for folder creation
 * - Used by TodoList page component
 * - Integrates with Supabase todo_folders table
 * 
 * Data Flow:
 * 1. User enters folder name and optional description
 * 2. Form submission triggers onSubmit callback
 * 3. useFolders hook handles the Supabase database operation
 * 4. On success, the modal closes and the folders list updates
 * 
 * Security:
 * - Folder creation is protected by Supabase RLS policies
 * - Only authenticated users can create folders
 * - Created folders inherit the user_id of the creator
 */

import React, { useState } from 'react';
import type { FolderInsert } from '../../types/folder';

interface CreateFolderModalProps {
  /** Callback function to handle folder creation */
  onSubmit: (folder: Omit<FolderInsert, 'user_id'>) => Promise<void>;
  /** Callback function to close the modal */
  onClose: () => void;
}

export default function CreateFolderModal({ onSubmit, onClose }: CreateFolderModalProps) {
  // Local state for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  /**
   * Handles form submission
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
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
              placeholder="Enter folder name"
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
              placeholder="Add a description for this folder"
              aria-label="Folder description"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              aria-label="Create folder"
            >
              Create Folder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Cancel folder creation"
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
 * import CreateFolderModal from './components/folders/CreateFolderModal';
 * import { useFolders } from './hooks/useFolders';
 * 
 * function ParentComponent() {
 *   const { createFolder } = useFolders();
 *   const [showModal, setShowModal] = useState(false);
 * 
 *   return (
 *     <>
 *       {showModal && (
 *         <CreateFolderModal
 *           onSubmit={createFolder}
 *           onClose={() => setShowModal(false)}
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