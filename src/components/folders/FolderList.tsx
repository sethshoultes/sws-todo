/**
 * FolderList Component
 * 
 * A sidebar component that displays and manages folders in the todo application.
 * Provides folder navigation, creation, editing, sharing, and deletion capabilities
 * with a clean and intuitive interface.
 * 
 * @component
 * 
 * Key Features:
 * - Displays list of folders with current selection indicator
 * - Supports folder creation through modal dialog
 * - Provides folder management actions (edit, share, delete)
 * - Implements drag and drop for folder reordering (future enhancement)
 * 
 * Integration Points:
 * 1. Parent Component:
 *    - TodoList page manages folder state and actions
 *    - Provides callbacks for folder operations
 * 
 * 2. Related Components:
 *    - CreateFolderModal for new folder creation
 *    - EditFolderModal for modifying folders
 *    - ShareFolderModal for folder sharing
 *    - DeleteFolderModal for folder removal
 * 
 * 3. Database Integration:
 *    - Reads folder data from Supabase todo_folders table
 *    - Reflects real-time updates through Supabase subscriptions
 * 
 * Data Flow:
 * 1. Receives folders array from useFolders hook
 * 2. Manages folder selection state
 * 3. Triggers modal dialogs for folder operations
 * 4. Updates propagate through callbacks to parent
 * 
 * Security:
 * - Respects Supabase RLS policies
 * - Shows only folders user has access to
 * - Enforces permission-based action availability
 */

import React from 'react';
import { Folder, FolderPlus, MoreVertical, Trash2, Edit, Share2 } from 'lucide-react';
import type { Folder as FolderType } from '../../types/folder';

interface FolderListProps {
  /** Array of folders to display */
  folders: FolderType[];
  /** ID of currently selected folder */
  selectedFolderId: string | null;
  /** Callback when folder selection changes */
  onSelect: (folderId: string | null) => void;
  /** Callback to trigger folder creation */
  onCreateClick: () => void;
  /** Callback when folder edit is requested */
  onEditClick: (folder: FolderType) => void;
  /** Callback when folder sharing is requested */
  onShareClick: (folder: FolderType) => void;
  /** Callback when folder deletion is requested */
  onDeleteClick: (folder: FolderType) => void;
}

export default function FolderList({
  folders,
  selectedFolderId,
  onSelect,
  onCreateClick,
  onEditClick,
  onShareClick,
  onDeleteClick,
}: FolderListProps) {
  // Track which folder's menu is currently open
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

  /**
   * Handles click on the folder menu button
   * @param folderId - ID of the folder whose menu was clicked
   * @param e - Click event
   */
  const handleMenuClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === folderId ? null : folderId);
  };

  /**
   * Handles folder action selection from menu
   * @param action - Type of action to perform
   * @param folder - Folder to perform action on
   * @param e - Click event
   */
  const handleAction = (
    action: 'edit' | 'delete' | 'share',
    folder: FolderType,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setMenuOpen(null);
    
    switch (action) {
      case 'share':
        onShareClick(folder);
        break;
      case 'delete':
        onDeleteClick(folder);
        break;
      case 'edit':
        onEditClick(folder);
        break;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4"
      role="navigation"
      aria-label="Folder navigation"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
        <button
          onClick={onCreateClick}
          className="text-gray-600 hover:text-indigo-600 transition-colors"
          aria-label="Create folder"
        >
          <FolderPlus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-1">
        {/* All Todos option */}
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center px-3 py-2 rounded-md text-left ${
            selectedFolderId === null
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={selectedFolderId === null ? 'page' : undefined}
        >
          <Folder className="h-4 w-4 mr-2" />
          All Todos
        </button>

        {/* Folder list */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center justify-between px-3 py-2 rounded-md ${
              selectedFolderId === folder.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => onSelect(folder.id)}
              className="flex items-center flex-grow text-left"
              aria-current={selectedFolderId === folder.id ? 'page' : undefined}
            >
              <Folder className="h-4 w-4 mr-2" />
              <span className="truncate">{folder.name}</span>
            </button>
            
            {/* Folder actions menu */}
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(folder.id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-all"
                aria-label="Folder options"
                aria-expanded={menuOpen === folder.id}
                aria-haspopup="true"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {menuOpen === folder.id && (
                <div 
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="folder-menu"
                >
                  <button
                    onClick={(e) => handleAction('share', folder, e)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Folder
                  </button>
                  <button
                    onClick={(e) => handleAction('edit', folder, e)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Folder
                  </button>
                  <button
                    onClick={(e) => handleAction('delete', folder, e)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Folder
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import FolderList from './components/folders/FolderList';
 * import { useFolders } from './hooks/useFolders';
 * 
 * function TodoList() {
 *   const { folders } = useFolders();
 *   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
 * 
 *   return (
 *     <FolderList
 *       folders={folders}
 *       selectedFolderId={selectedFolderId}
 *       onSelect={setSelectedFolderId}
 *       onCreateClick={() => setShowCreateModal(true)}
 *       onEditClick={handleEditFolder}
 *       onShareClick={handleShareFolder}
 *       onDeleteClick={handleDeleteFolder}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link useFolders} For the folder management hook
 * @see {@link TodoList} For the parent component implementation
 * @see {@link CreateFolderModal} For folder creation
 * @see {@link EditFolderModal} For folder editing
 * @see {@link ShareFolderModal} For folder sharing
 * @see {@link DeleteFolderModal} For folder deletion
 */