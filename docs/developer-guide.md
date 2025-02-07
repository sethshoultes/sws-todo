# SWS Todo App Developer Guide

## Overview

SWS Todo is a modern, collaborative todo application built with React, TypeScript, and Supabase. It features real-time updates, folder organization, sharing capabilities, and offline support through PWA functionality.

## Tech Stack

- **Frontend:**
  - React 18.3
  - TypeScript 5.5
  - Vite 5.4
  - Tailwind CSS 3.4
  - Lucide React (icons)

- **Backend:**
  - Supabase (PostgreSQL)
  - Row Level Security (RLS)
  - Real-time subscriptions

## Project Structure

```
sws-todo-app/
├── docs/                      # Documentation
│   ├── database-schema.md     # Database structure
│   └── specs/                 # Feature specifications
├── public/                    # Static assets
│   ├── icons/                # App icons
│   ├── manifest.json         # PWA manifest
│   ├── service-worker.js     # Service worker
│   └── _redirects            # Netlify redirects
├── src/
│   ├── components/           # React components
│   │   ├── folders/         # Folder-related components
│   │   ├── todos/          # Todo-related components
│   │   ├── Footer.tsx      # Footer component
│   │   ├── Layout.tsx      # Main layout
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── ProtectedRoute.tsx # Auth route wrapper
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useBulkActions.ts   # Bulk operations
│   │   ├── useDragAndDrop.ts   # Drag-drop functionality
│   │   ├── useFolders.ts       # Folder management
│   │   ├── useTodoOrder.ts     # Todo ordering
│   │   └── useTodos.ts         # Todo management
│   ├── lib/                 # Utilities
│   │   └── supabase.ts     # Supabase client
│   ├── pages/              # Route components
│   │   ├── Home.tsx       # Landing page
│   │   ├── Login.tsx     # Login page
│   │   ├── Register.tsx  # Registration page
│   │   └── TodoList.tsx  # Main todo interface
│   ├── types/             # TypeScript types
│   │   ├── folder.ts     # Folder types
│   │   ├── supabase.ts   # Database types
│   │   └── todo.ts       # Todo types
│   ├── App.tsx           # Root component
│   ├── index.css         # Global styles
│   └── main.tsx         # Entry point
├── supabase/            # Supabase configuration
│   └── migrations/      # Database migrations
└── package.json        # Dependencies and scripts
```

## Key Features

### 1. Authentication
- Email/password authentication
- Protected routes
- Session management
- Real-time auth state

### 2. Todo Management
- Create, read, update, delete todos
- Rich text descriptions
- Completion status
- Real-time updates
- Drag-and-drop reordering

### 3. Folder Organization
- Create and manage folders
- Move todos between folders
- Folder sharing
- Permission levels (view/edit/manage)

### 4. Collaboration
- Share todos and folders
- Granular permissions
- Real-time updates
- User profiles

### 5. Offline Support
- Progressive Web App (PWA)
- Service worker caching
- Offline data access
- Background sync

## Database Architecture

### Tables

1. **todo_profiles**
   - Links to Supabase auth
   - Stores user information
   - Automatic creation on signup

2. **todo_folders**
   - Organizes todos
   - Supports sharing
   - Permission arrays

3. **todos**
   - Core todo items
   - Folder relationships
   - Sharing capabilities
   - Completion status

4. **todo_user_preferences**
   - User preferences
   - Todo ordering
   - UI settings

See [database-schema.md](./database-schema.md) for detailed schema information.

## Security

### Row Level Security (RLS)

1. **Profiles**
   - View: All authenticated users
   - Update: Own profile only
   - Insert: Auth trigger only

2. **Folders**
   - Full access: Owner
   - View: Shared users
   - Edit: Users with edit permission

3. **Todos**
   - Full access: Owner
   - View: Shared users and folder members
   - Edit: Users with edit permission

### Data Access Patterns

1. **Todo Creation:**
```typescript
const { data, error } = await supabase
  .from('todos')
  .insert({
    title: string,
    description?: string,
    user_id: string,
    folder_id?: string
  })
  .select();
```

2. **Folder Sharing:**
```typescript
const { error } = await supabase
  .from('todo_folders')
  .update({
    shared_with: arrayOfUserIds,
    can_edit: arrayOfEditorIds
  })
  .eq('id', folderId);
```

## State Management

### 1. Authentication Context
- User state
- Login/logout
- Session persistence
- Protected routes

### 2. Custom Hooks
- `useTodos`: Todo CRUD operations
- `useFolders`: Folder management
- `useTodoOrder`: Order persistence
- `useBulkActions`: Multi-item operations
- `useDragAndDrop`: Reordering functionality

## Real-time Updates

### 1. Subscriptions
```typescript
const subscription = supabase
  .channel('todos')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe();
```

### 2. Optimistic Updates
```typescript
// Update local state
setTodos(current =>
  current.map(t =>
    t.id === todo.id ? { ...t, is_complete: !t.is_complete } : t
  )
);

// Persist to database
const { error } = await supabase
  .from('todos')
  .update({ is_complete: !todo.is_complete })
  .eq('id', todo.id);

// Rollback on error
if (error) {
  setTodos(current =>
    current.map(t =>
      t.id === todo.id ? { ...t, is_complete: todo.is_complete } : t
    )
  );
}
```

## Performance Optimizations

### 1. Database
- Efficient indexes
- GIN indexes for arrays
- JSONB for preferences
- Optimized queries

### 2. Frontend
- Lazy loading
- Optimistic updates
- Debounced preferences
- Efficient re-renders

### 3. Caching
- Service worker cache
- API response caching
- Asset optimization
- PWA installation

## Development Workflow

### 1. Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Migrations
```bash
# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local > src/types/supabase.ts
```

## Deployment

### 1. Build Process
```bash
# Production build
npm run build

# Output in dist/
- Optimized assets
- Service worker
- Static files
```

### 2. Hosting
- Netlify configuration
- PWA support
- Redirect rules
- HTTPS required

## Testing

### 1. Type Safety
- TypeScript strict mode
- Generated Supabase types
- Props validation

### 2. Error Handling
- API error handling
- Optimistic update rollbacks
- Toast notifications
- Loading states

## Future Enhancements

1. **Features**
   - Nested folders
   - Rich text editor
   - File attachments
   - Calendar integration

2. **Technical**
   - E2E tests
   - Performance monitoring
   - Analytics integration
   - Enhanced offline support

## Contributing

1. **Code Style**
   - ESLint configuration with TypeScript integration
   - Consistent code formatting using Prettier
   - Strict TypeScript checks enabled
   - Comprehensive JSDoc comments
   - Component-specific documentation
   - Consistent file structure and naming

2. **Pull Requests**
   - Feature branch workflow (feature/*, bugfix/*)
   - Comprehensive testing before submission
   - Updated documentation reflecting changes
   - Performance impact assessment
   - Security considerations
   - Accessibility compliance

## Component Architecture

### 1. Component Organization

```typescript
// Functional component with TypeScript
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Implementation
};
```

### 2. Component Patterns

#### Container Components
```typescript
// Data fetching and state management
const TodoListContainer = () => {
  const { todos, loading } = useTodos();
  return <TodoList todos={todos} loading={loading} />;
};
```

#### Presentational Components
```typescript
// Pure rendering with props
const TodoList: React.FC<TodoListProps> = ({ todos, loading }) => {
  if (loading) return <LoadingSpinner />;
  return <div>{todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}</div>;
};
```

## State Management Patterns

### 1. Local State
```typescript
const [state, setState] = useState<StateType>({
  // Initial state
});

// Batch updates
setState(prev => ({
  ...prev,
  updatedField: newValue
}));
```

### 2. Context Usage
```typescript
const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within TodoProvider');
  }
  return context;
};
```

## Error Handling Patterns

### 1. API Error Handling
```typescript
try {
  const { data, error } = await supabase.from('todos').select('*');
  if (error) throw error;
  // Handle success
} catch (error) {
  // Log error
  console.error('API Error:', error);
  // Show user-friendly message
  toast.error('Failed to load todos');
  // Implement fallback behavior
  return fallbackData;
}
```

### 2. Component Error Boundaries
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

## Performance Patterns

### 1. Memo Usage
```typescript
const MemoizedComponent = React.memo(({ prop1, prop2 }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.prop1 === nextProps.prop1;
});
```

### 2. Callback Optimization
```typescript
const memoizedCallback = useCallback((param: Type) => {
  // Callback logic
}, [dependency1, dependency2]);
```

### 3. Effect Cleanup
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('todos')
    .subscribe();

  // Cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Testing Patterns

### 1. Component Testing
```typescript
describe('TodoItem', () => {
  it('renders correctly', () => {
    const todo = { id: '1', title: 'Test' };
    render(<TodoItem todo={todo} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles toggle action', async () => {
    const onToggle = jest.fn();
    const todo = { id: '1', title: 'Test' };
    render(<TodoItem todo={todo} onToggle={onToggle} />);
    
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(todo);
  });
});
```

### 2. Hook Testing
```typescript
describe('useTodos', () => {
  it('fetches todos on mount', async () => {
    const { result } = renderHook(() => useTodos());
    
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(2);
    });
  });
});
```

## Accessibility Patterns

### 1. ARIA Attributes
```typescript
const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  return (
    <div
      role="listitem"
      aria-label={`Todo: ${todo.title}`}
      aria-checked={todo.is_complete}
    >
      {/* Content */}
    </div>
  );
};
```

### 2. Keyboard Navigation
```typescript
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onToggle(todo);
  }
};

return (
  <div
    tabIndex={0}
    onKeyPress={handleKeyPress}
    role="button"
  >
    {/* Content */}
  </div>
);
```

## Security Best Practices

### 1. Input Validation
```typescript
const validateTodoInput = (input: TodoInput): boolean => {
  if (!input.title?.trim()) return false;
  if (input.title.length > 255) return false;
  return true;
};
```

### 2. XSS Prevention
```typescript
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};
```

### 3. Authentication Checks
```typescript
const checkPermission = (userId: string, resource: Resource): boolean => {
  return resource.user_id === userId || 
         resource.shared_with?.includes(userId);
};
```

## Deployment Checklist

### 1. Pre-deployment
- Run all tests
- Build optimization
- Environment variables
- Database migrations
- Type generation

### 2. Deployment Process
- Asset optimization
- Cache configuration
- CDN setup
- SSL certification
- Database backup

### 3. Post-deployment
- Smoke tests
- Performance monitoring
- Error tracking
- Analytics setup
- User feedback collection

## Monitoring and Maintenance

### 1. Performance Monitoring
- Page load times
- API response times
- Database query performance
- Client-side rendering metrics

### 2. Error Tracking
- Client-side errors
- API failures
- Database exceptions
- Authentication issues

### 3. Usage Analytics
- User engagement
- Feature adoption
- Error rates
- Performance metrics

## Version Control Guidelines

### 1. Branch Strategy
- main: Production code
- develop: Development branch
- feature/*: New features
- bugfix/*: Bug fixes
- release/*: Release preparation

### 2. Commit Messages
```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Test addition/modification
- chore: Maintenance tasks
```

### 3. Code Review Process
- Feature completeness
- Code quality
- Test coverage
- Documentation
- Performance impact
- Security considerations
- Accessibility compliance

## Folder Sharing System

### Overview

The folder sharing system enables collaborative todo management through a granular permissions model. It supports:

- Sharing folders with multiple users
- Different permission levels (view/edit/manage)
- Inherited permissions for todos
- Real-time updates for all participants

### Data Structure

```typescript
interface Folder {
  id: string;
  name: string;
  description: string | null;
  user_id: string;            // Owner
  shared_with: string[];      // Users with access
  can_edit: string[];         // Users with edit rights
}
```

### Permission Levels

1. **View Access** (`shared_with` array)
   - Can see folder and contained todos
   - Cannot modify folder or todos
   - Included in real-time updates

2. **Edit Access** (`can_edit` array)
   - All view permissions
   - Can add/edit/complete todos
   - Can modify folder name/description

3. **Owner Access** (`user_id`)
   - Full control over folder
   - Can manage sharing permissions
   - Can delete folder

### Implementation Details

#### 1. Sharing Process
```typescript
const shareFolder = async (
  folder: Folder,
  userId: string,
  permission: Permission
) => {
  // Update folder permissions
  const updates: Partial<Folder> = {
    shared_with: [...folder.shared_with, userId]
  };
  
  if (permission === 'edit') {
    updates.can_edit = [...folder.can_edit, userId];
  }

  // Update folder
  await supabase
    .from('todo_folders')
    .update(updates)
    .eq('id', folder.id);

  // Update contained todos
  await supabase
    .from('todos')
    .update(updates)
    .eq('folder_id', folder.id);
};
```

#### 2. Permission Inheritance
```typescript
// When creating a todo in a shared folder
const createTodo = async (todo: TodoInput, folderId: string) => {
  const { data: folder } = await supabase
    .from('todo_folders')
    .select('shared_with, can_edit')
    .eq('id', folderId)
    .single();

  await supabase.from('todos').insert({
    ...todo,
    folder_id: folderId,
    shared_with: folder.shared_with,
    can_edit: folder.can_edit
  });
};
```

#### 3. Access Control
```sql
-- Folder access policy
CREATE POLICY "Shared users can view folders"
  ON todo_folders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY(shared_with) OR
    auth.uid() = user_id
  );

-- Todo access policy
CREATE POLICY "Users can view todos in shared folders"
  ON todos FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(shared_with) OR
    folder_id IN (
      SELECT id FROM todo_folders
      WHERE auth.uid() = ANY(shared_with)
    )
  );
```

### Real-time Updates

```typescript
// Subscribe to shared folder changes
const subscribeToFolder = (folderId: string) => {
  return supabase
    .channel(`folder:${folderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'todos',
        filter: `folder_id=eq.${folderId}`
      },
      (payload) => {
        // Handle todo changes
      }
    )
    .subscribe();
};
```

### UI Components

#### 1. Share Modal
```typescript
interface ShareFolderModalProps {
  folder: Folder;
  onShare: (userId: string, permission: Permission) => Promise<void>;
  onClose: () => void;
}
```

#### 2. Permission Display
```typescript
const FolderPermissions: React.FC<{ folder: Folder }> = ({ folder }) => {
  const { user } = useAuth();
  
  const getPermissionLevel = (): Permission => {
    if (folder.user_id === user?.id) return 'owner';
    if (folder.can_edit?.includes(user?.id)) return 'edit';
    if (folder.shared_with?.includes(user?.id)) return 'view';
    return 'none';
  };

  return <PermissionBadge level={getPermissionLevel()} />;
};
```

### Security Considerations

1. **Permission Validation**
   - Double-check permissions server-side
   - Validate all permission changes
   - Prevent privilege escalation

2. **Cascading Updates**
   - Maintain consistency between folder and todos
   - Handle permission revocation
   - Clean up orphaned shares

3. **Access Control**
   - RLS policies for all operations
   - Validate user existence
   - Audit permission changes

### Error Handling

```typescript
const handleShare = async (userId: string, permission: Permission) => {
  try {
    // Validate user exists
    const { data: user } = await supabase
      .from('todo_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Perform share operation
    await shareFolder(folder, userId, permission);

    toast.success('Folder shared successfully');
  } catch (error) {
    toast.error('Failed to share folder');
    // Log error for monitoring
    console.error('Share error:', error);
  }
};
```