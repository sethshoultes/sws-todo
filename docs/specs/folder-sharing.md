# Todo Folder Sharing System Specification

## Overview

The folder sharing system allows users to organize todos into folders and share entire folders with other users. This provides a more organized way to collaborate on groups of related todos.


### Phase 1: Core Functionality

#### Completed:
#### Core Database:
- [✓] Created `todo_folders` table with required fields
- [✓] Added `folder_id` to todos table
- [✓] Implemented RLS policies for access control

#### UI Components:
- [✓] FolderList sidebar with folder navigation
- [✓] CreateFolderModal for new folder creation
- [✓] ShareFolderModal for folder sharing
- [✓] Folder selection in TodoForm
- [✓] Todo filtering by folder

#### Features:
- [✓] Basic folder CRUD (Create, Read)
- [✓] Folder sharing with permission levels
- [✓] Real-time updates for folder changes
- [✓] Todo organization by folders
- [✓] Folder deletion with orphaned todo handling
- [✓] Drag and drop reordering with persistence

#### Next Steps:
1. Bulk Operations (Next):
   - Multi-select todos
   - Batch move to folders
   - Batch delete
   - Batch status update

2. UI Enhancements:
   - Folder search/filter
   - Color customization
   - Sorting options
   - Improved sharing UI

#### Phase 2 Preparation:
1. Design notification system for shared folders
2. Plan folder activity tracking
3. Design UI for viewing shared folder members
4. Plan implementation of folder templates

## Database Schema

We'll need to add a new `todo_folders` table and modify the `todos` table:

```sql
-- User preferences table for storing todo order and other settings
CREATE TABLE todo_user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

```sql
-- New folders table
CREATE TABLE todo_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users NOT NULL,
  shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  can_edit uuid[] DEFAULT ARRAY[]::uuid[]
);

-- Add folder_id to todos table
ALTER TABLE todos ADD COLUMN folder_id uuid REFERENCES folders;
```

## Security Policies

1. Folder Access:
   - Owners have full CRUD access to their folders
   - Shared users can view folders shared with them
   - Users with edit permissions can modify folder contents

2. Todo Access within Folders:
   - Inherits permissions from parent folder
   - Individual todo sharing still possible for flexibility

## Features

### 1. Folder Management

- Create folders with name and optional description
- Move todos between folders
- Delete folders with proper cleanup
- Persistent todo ordering within folders
- Bulk operations on folder contents
- Nested folder support (optional future enhancement)

### 2. Folder Sharing

- Share entire folders with other users
- Set permission levels:
  - View only: Can see todos but not modify
  - Edit: Can add/edit/complete todos
  - Manage: Can add/remove users and change permissions

### 3. User Interface

#### Folder List View
```tsx
interface FolderListProps {
  folders: Folder[];
  onSelect: (folderId: string) => void;
  onShare: (folder: Folder) => void;
}
```

#### Folder Details View
```tsx
interface FolderDetailsProps {
  folder: Folder;
  todos: Todo[];
  onAddTodo: (todo: TodoInsert) => Promise<void>;
  onMoveTodo: (todoId: string, targetFolderId: string) => Promise<void>;
}
```

### 4. API Endpoints

1. Folder Operations:
   ```typescript
   // Create folder
   createFolder(name: string, description?: string): Promise<Folder>
   
   // Share folder
   shareFolder(folderId: string, userEmail: string, permission: 'view' | 'edit' | 'manage'): Promise<void>
   
   // Move todo to folder
   moveTodoToFolder(todoId: string, folderId: string): Promise<void>
   ```

2. Bulk Operations:
   ```typescript
   // Move multiple todos
   moveTodosToFolder(todoIds: string[], folderId: string): Promise<void>
   
   // Share multiple folders
   shareFoldersWithUser(folderIds: string[], userEmail: string, permission: string): Promise<void>
   ```

## Implementation Phases

### Phase 1: Core Functionality
1. Create folders table and update todos table
2. Implement basic folder CRUD operations
3. Add folder selection to todo creation/editing

### Phase 2: Sharing Features
1. Implement folder sharing functionality
2. Add permission management
3. Update security policies

### Phase 3: UI Enhancements
1. Drag-and-drop support for moving todos
2. Bulk operations interface
3. Folder organization features

## User Experience

1. Folder Navigation:
   - Sidebar displays folder list
   - Click folder to view contents
   - Drag todos between folders

2. Sharing Flow:
   - Click share button on folder
   - Enter email and select permissions
   - Recipients get notification

3. Permission Management:
   - View shared users and permissions
   - Modify or revoke access
   - Transfer folder ownership

## Current Implementation Details

### Folder Management
```typescript
interface FolderOperations {
  // Existing operations
  createFolder: (data: FolderInsert) => Promise<void>;
  shareFolder: (folder: Folder, email: string, permission: Permission) => Promise<void>;
  
  // To be implemented
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, data: Partial<FolderUpdate>) => Promise<void>;
  moveToFolder: (todoIds: string[], folderId: string | null) => Promise<void>;
}
```

### UI Components Structure
```
components/
  folders/
    ├── FolderList.tsx         // Folder navigation
    ├── CreateFolderModal.tsx  // New folder creation
    ├── ShareFolderModal.tsx   // Folder sharing
    └── DeleteFolderModal.tsx  // (To be implemented)
```

### Data Flow
1. User Actions:
   - Create/Delete folders
   - Move todos between folders
   - Share folders

2. State Management:
   - Local state for UI
   - Supabase real-time for sync
   - Optimistic updates

3. Error Handling:
   - Validation
   - Conflict resolution
   - Fallback strategies

## Technical Considerations

1. Performance:
   - Efficient folder content loading
   - Pagination for large folders
   - Optimistic UI updates

2. Offline Support:
   - Cache folder structure
   - Queue sharing operations
   - Sync on reconnection

3. Security:
   - Validate all permission changes
   - Prevent privilege escalation
   - Audit sharing activities

## Future Enhancements

1. Folder Features:
   - Nested folders
   - Folder templates
   - Archive/restore

2. Collaboration:
   - Comments on folders
   - Activity feed
   - Shared folder discovery

3. Integration:
   - Calendar view
   - Export/import
   - API access

## Error Handling

1. Share Operations:
   - Invalid email handling
   - Permission conflicts
   - Network failures

2. Data Integrity:
   - Folder deletion safeguards
   - Orphaned todo prevention

## Testing Strategy

1. Unit Tests:
   - Folder operations
   - Permission checks
   - Data validation

2. Integration Tests:
   - Sharing workflows
   - Real-time updates
   - Offline behavior

3. E2E Tests:
   - Complete sharing scenarios
   - Permission enforcement
   - UI interactions