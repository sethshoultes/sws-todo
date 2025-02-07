/**
 * useFolders Hook
 * 
 * A custom hook that manages folder operations in the todo application.
 * Handles folder CRUD operations, sharing capabilities, and real-time updates
 * through Supabase integration.
 * 
 * @hook
 * 
 * Key Features:
 * - Folder CRUD operations
 * - Real-time updates
 * - Sharing capabilities
 * - Permission management
 * - Optimistic updates
 * - Error handling
 * 
 * Integration Points:
 * 1. Database:
 *    - todo_folders table operations
 *    - Real-time subscriptions
 *    - RLS policy compliance
 *    - Cascading updates
 * 
 * 2. Authentication:
 *    - User context integration
 *    - Permission validation
 *    - Access control
 * 
 * 3. Related Components:
 *    - FolderList for display
 *    - CreateFolderModal for creation
 *    - ShareFolderModal for sharing
 *    - EditFolderModal for updates
 * 
 * Data Flow:
 * 1. Initial Load:
 *    - Fetch user's folders
 *    - Fetch shared folders
 *    - Subscribe to changes
 * 
 * 2. Operations:
 *    - Create/Update/Delete folders
 *    - Manage sharing permissions
 *    - Handle cascading effects
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
import type { Folder, FolderInsert, Permission } from '../types/folder';

export function useFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);

  /**
   * Updates an existing folder's properties
   * @param folder - The folder with updated values
   */
  const updateFolder = useCallback(async (folder: Folder) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('todo_folders')
        .update({
          name: folder.name,
          description: folder.description
        })
        .eq('id', folder.id);

      if (error) throw error;

      setFolders((current) =>
        current.map((f) => (f.id === folder.id ? folder : f))
      );
      toast.success('Folder updated successfully!');
    } catch (error) {
      toast.error('Failed to update folder');
    }
  }, [user]);

  // Fetch folders and set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const fetchFolders = async () => {
      console.log('Fetching folders for user:', user.id);

      // First get folders owned by the user
      const { data: ownedFolders, error: ownedError } = await supabase
        .from('todo_folders')
        .select('*')
        .eq('user_id', user.id);

      console.log('Owned folders:', ownedFolders);

      if (ownedError) {
        console.error('Error fetching owned folders:', ownedError);
        toast.error('Failed to fetch folders');
        return;
      }

      // Then get folders shared with the user
      console.log('Fetching shared folders for user:', user.id);

      const { data: sharedFolders, error: sharedError } = await supabase
        .from('todo_folders')
        .select('*')
        .contains('shared_with', [user.id]);

      console.log('Shared folders:', sharedFolders);

      if (sharedError) {
        console.error('Error fetching shared folders:', sharedError);
        toast.error('Failed to fetch shared folders');
        return;
      }

      // Combine owned and shared folders, removing duplicates
      const allFolders = [...(ownedFolders || []), ...(sharedFolders || [])];
      console.log('Combined folders:', allFolders);
      
      const uniqueFolders = allFolders.filter((folder, index, self) =>
        index === self.findIndex((f) => f.id === folder.id)
      );

      console.log('Final unique folders:', uniqueFolders);
      setFolders(uniqueFolders);
    };

    fetchFolders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('todo_folders')
      .on(
        'postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'todo_folders',
          or: [
            { column: 'user_id', eq: user.id },
            { column: 'shared_with', contains: [user.id] }
          ]
        },
        (payload) => {
          if (payload.new) {
            setFolders((current) => {
              const exists = current.find((folder) => folder.id === payload.new.id);
              if (exists) {
                return current.map((folder) =>
                  folder.id === payload.new.id ? payload.new : folder
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
   * Creates a new folder
   * @param folderData - The folder data excluding user_id
   */
  const createFolder = useCallback(async (folderData: Omit<FolderInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('todo_folders')
        .insert({ ...folderData, user_id: user.id })
        .select();

      if (error) throw error;
      if (data) {
        setFolders((current) => [...current, data[0]]);
        toast.success('Folder created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create folder');
    }
  }, [user]);

  /**
   * Deletes a folder and handles orphaned todos
   * @param folder - The folder to delete
   */
  const deleteFolder = useCallback(async (folder: Folder) => {
    if (!user) return;

    try {
      // Move todos to root level before deleting folder
      const { error: updateError } = await supabase
        .from('todos')
        .update({ folder_id: null })
        .eq('folder_id', folder.id);

      if (updateError) throw updateError;

      // Delete the folder
      const { error: deleteError } = await supabase
        .from('todo_folders')
        .delete()
        .eq('id', folder.id);

      if (deleteError) throw deleteError;

      setFolders((current) => current.filter((f) => f.id !== folder.id));
      toast.success('Folder deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete folder');
    }
  }, [user]);

  /**
   * Shares a folder with another user
   * @param folder - The folder to share
   * @param userId - The recipient's user ID
   * @param permission - The permission level to grant
   */
  const shareFolder = useCallback(async (folder: Folder, userId: string, permission: Permission) => {
    if (!user) return;

    try {
      // Update sharing permissions
      const updates: Partial<Folder> = {
        shared_with: Array.from(new Set([...(folder.shared_with || []), userId]))
      };

      if (permission === 'edit' || permission === 'manage') {
        updates.can_edit = Array.from(new Set([...(folder.can_edit || []), userId]));
      }

      console.log('Sharing folder:', folder.id, 'with user:', userId, 'updates:', updates);

      // Update folder permissions
      const { error } = await supabase
        .from('todo_folders')
        .update(updates)
        .eq('id', folder.id);

      if (error) {
        console.error('Error sharing folder:', error);
        throw error;
      }
      
      // Update permissions for all todos in the folder
      const { error: todosError } = await supabase
        .from('todos')
        .update({
          shared_with: updates.shared_with,
          can_edit: updates.can_edit
        })
        .eq('folder_id', folder.id);

      if (todosError) {
        console.error('Error sharing todos:', todosError);
        throw todosError;
      }
      
      // Update local state
      setFolders((current) =>
        current.map((f) =>
          f.id === folder.id
            ? {
                ...f,
                shared_with: Array.from(new Set([...(f.shared_with || []), userId])),
                can_edit:
                  permission === 'edit' || permission === 'manage'
                    ? Array.from(new Set([...(f.can_edit || []), userId]))
                    : f.can_edit,
              }
            : f
        )
      );

      toast.success('Folder shared successfully!');
    } catch (error) {
      console.error('Failed to share folder:', error);
      toast.error('Failed to share folder');
      throw error;
    }
  }, [user]);

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    shareFolder,
  };
}

/**
 * Hook Usage Example:
 * 
 * ```tsx
 * import { useFolders } from '../hooks/useFolders';
 * 
 * function TodoList() {
 *   const {
 *     folders,
 *     createFolder,
 *     updateFolder,
 *     deleteFolder,
 *     shareFolder
 *   } = useFolders();
 * 
 *   return (
 *     <div>
 *       <FolderList
 *         folders={folders}
 *         onCreateClick={() => setShowCreateModal(true)}
 *         onEditClick={(folder) => setEditingFolder(folder)}
 *         onShareClick={(folder) => setSharingFolder(folder)}
 *         onDeleteClick={(folder) => setDeletingFolder(folder)}
 *       />
 *       
 *       {showCreateModal && (
 *         <CreateFolderModal
 *           onSubmit={createFolder}
 *           onClose={() => setShowCreateModal(false)}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link FolderList} For folder display component
 * @see {@link CreateFolderModal} For folder creation
 * @see {@link ShareFolderModal} For folder sharing
 * @see {@link EditFolderModal} For folder editing
 */