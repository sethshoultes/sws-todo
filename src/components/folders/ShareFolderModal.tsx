/**
 * ShareFolderModal Component
 * 
 * A modal dialog component that enables users to share folders with other users
 * and set appropriate permission levels. This component is a critical part of
 * the application's collaboration features.
 * 
 * @component
 * 
 * Key Features:
 * - User selection from available users
 * - Permission level assignment (view/edit/manage)
 * - Real-time validation and error handling
 * - Accessible form controls
 * 
 * Integration Points:
 * 1. Database:
 *    - Reads user list from todo_profiles table
 *    - Updates folder sharing settings in todo_folders table
 *    - Cascades permissions to todos within the folder
 * 
 * 2. Authentication:
 *    - Uses AuthContext to identify current user
 *    - Filters out current user from sharing options
 * 
 * 3. Parent Components:
 *    - TodoList manages sharing state
 *    - useFolders hook handles share operations
 * 
 * Data Flow:
 * 1. Component Mount:
 *    - Fetches available users from todo_profiles
 *    - Excludes current user from list
 * 
 * 2. Share Operation:
 *    - Validates selection
 *    - Calls onShare callback with:
 *      - Selected user ID
 *      - Chosen permission level
 *    - Updates folder and contained todos
 * 
 * Security Considerations:
 * - Only authenticated users can share folders
 * - Users can only share folders they own
 * - Permission inheritance for contained todos
 * - RLS policies enforce access control
 */

import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import type { Folder, Permission } from '../../types/folder';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  email: string;
}

interface ShareFolderModalProps {
  /** The folder being shared */
  folder: Folder;
  /** Callback to handle folder sharing */
  onShare: (folder: Folder, userId: string, permission: Permission) => Promise<void>;
  /** Callback to close the modal */
  onClose: () => void;
}

export default function ShareFolderModal({ folder, onShare, onClose }: ShareFolderModalProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permission, setPermission] = useState<Permission>('view');
  const [loading, setLoading] = useState(false);

  /**
   * Fetches available users for sharing
   * Excludes current user and limits results for performance
   */
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('todo_profiles')
        .select('id, email')
        .neq('id', currentUser.id)
        .limit(100);

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data);
    };

    fetchUsers();
  }, [currentUser]);

  /**
   * Handles form submission and sharing process
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    try {
      await onShare(folder, selectedUserId, permission);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      role="dialog"
      aria-labelledby="share-folder-title"
      aria-describedby="share-folder-description"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="h-6 w-6 text-indigo-600" />
          <h3 id="share-folder-title" className="text-lg font-semibold">
            Share Folder
          </h3>
        </div>

        <p 
          id="share-folder-description" 
          className="text-gray-600 mb-4"
        >
          Share "{folder.name}" with another user
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="user" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select User
            </label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              aria-required="true"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label 
              htmlFor="permission" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Permission Level
            </label>
            <select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value as Permission)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              aria-describedby="permission-description"
            >
              <option value="view">View only</option>
              <option value="edit">Can edit</option>
              <option value="manage">Can manage</option>
            </select>
            <p 
              id="permission-description" 
              className="mt-1 text-sm text-gray-500"
            >
              {permission === 'view' && 'User can only view todos in this folder'}
              {permission === 'edit' && 'User can add, edit, and complete todos'}
              {permission === 'manage' && 'User can edit folder settings and manage sharing'}
            </p>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={loading || !selectedUserId}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              aria-label={loading ? 'Sharing folder...' : 'Share folder'}
            >
              {loading ? 'Sharing...' : 'Share Folder'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Cancel sharing"
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
 * import ShareFolderModal from './components/folders/ShareFolderModal';
 * import { useFolders } from './hooks/useFolders';
 * 
 * function ParentComponent() {
 *   const { shareFolder } = useFolders();
 *   const [sharingFolder, setSharingFolder] = useState<Folder | null>(null);
 * 
 *   return (
 *     <>
 *       {sharingFolder && (
 *         <ShareFolderModal
 *           folder={sharingFolder}
 *           onShare={shareFolder}
 *           onClose={() => setSharingFolder(null)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 * 
 * @see {@link useFolders} For the folder management hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link Permission} For permission type definition
 */