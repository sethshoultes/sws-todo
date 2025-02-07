# SWS Todo App Database Schema

## Overview

The SWS Todo application uses a Supabase PostgreSQL database with a schema designed to support:
- Todo management with folder organization
- User collaboration and sharing
- Preference persistence
- Real-time updates
- Row Level Security (RLS)

## Tables

### 1. todo_profiles
Stores user profile information and links to Supabase auth.

```sql
CREATE TABLE todo_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Indexes:**
- `idx_todo_profiles_email` on `(email)`

**Relationships:**
- `id` references `auth.users` (Supabase auth)

### 2. todo_folders
Organizes todos into shareable collections.

```sql
CREATE TABLE todo_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users NOT NULL,
  shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  can_edit uuid[] DEFAULT ARRAY[]::uuid[]
);
```

**Indexes:**
- `idx_folders_user_id` on `(user_id)`
- `idx_todo_folders_shared_with` on `shared_with` using GIN
- `idx_todo_folders_can_edit` on `can_edit` using GIN

**Relationships:**
- `user_id` references `auth.users`
- Referenced by `todos.folder_id`

### 3. todos
Stores individual todo items with sharing capabilities.

```sql
CREATE TABLE todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text,
  is_complete boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL,
  folder_id uuid REFERENCES todo_folders,
  shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  can_edit uuid[] DEFAULT ARRAY[]::uuid[]
);
```

**Indexes:**
- `idx_todos_user_id` on `(user_id)`
- `idx_todos_folder_id` on `(folder_id)`
- `idx_todos_shared_with` on `shared_with` using GIN
- `idx_todos_can_edit` on `can_edit` using GIN

**Relationships:**
- `user_id` references `auth.users`
- `folder_id` references `todo_folders(id)`

### 4. todo_user_preferences
Stores user preferences including todo ordering.

```sql
CREATE TABLE todo_user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relationships:**
- `user_id` references `auth.users`

## Security Policies (RLS)

### todo_profiles

1. View all profiles (authenticated):
```sql
CREATE POLICY "Users can view all profiles"
  ON todo_profiles FOR SELECT
  TO authenticated USING (true);
```

2. Update own profile:
```sql
CREATE POLICY "Users can update own profile"
  ON todo_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id);
```

3. Insert profile (auth trigger):
```sql
CREATE POLICY "Enable insert for authentication trigger"
  ON todo_profiles FOR INSERT
  TO authenticated WITH CHECK (true);
```

### todo_folders

1. Full access to own folders:
```sql
CREATE POLICY "Users can manage their own folders"
  ON todo_folders FOR ALL
  TO authenticated USING (auth.uid() = user_id);
```

2. View shared folders:
```sql
CREATE POLICY "Shared users can view folders"
  ON todo_folders FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(shared_with) OR auth.uid() = user_id);
```

3. Edit shared folders:
```sql
CREATE POLICY "Users with edit permission can update folders"
  ON todo_folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(can_edit) OR auth.uid() = user_id);
```

### todos

1. Full access to own todos:
```sql
CREATE POLICY "Users can manage their own todos"
  ON todos FOR ALL
  TO authenticated USING (auth.uid() = user_id);
```

2. View shared todos:
```sql
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

3. Edit shared todos:
```sql
CREATE POLICY "Users can edit todos in shared folders"
  ON todos FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(can_edit) OR
    folder_id IN (
      SELECT id FROM todo_folders
      WHERE auth.uid() = ANY(can_edit)
    )
  );
```

### todo_user_preferences

1. Full access to own preferences:
```sql
CREATE POLICY "Users can manage their own preferences"
  ON todo_user_preferences FOR ALL
  TO authenticated USING (auth.uid() = user_id);
```

## Triggers

### 1. Updated Timestamps
Automatically updates `updated_at` columns:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to:
CREATE TRIGGER update_todo_profiles_updated_at
  BEFORE UPDATE ON todo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_user_preferences_updated_at
  BEFORE UPDATE ON todo_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. New User Handler
Creates profile entries for new users:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.todo_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Data Flow

### Todo Creation
1. User creates todo
2. If in folder, inherits folder sharing permissions
3. Real-time updates notify shared users
4. Order preferences updated if necessary

### Folder Sharing
1. Folder sharing permissions updated
2. All todos in folder inherit new permissions
3. Real-time updates notify newly shared users
4. Shared users can view/edit based on permissions

### Todo Updates
1. Changes checked against RLS policies
2. Real-time notifications sent to shared users
3. Order preferences updated if position changed
4. Optimistic updates with error rollback

## Performance Considerations

1. **Indexes:**
   - GIN indexes for array columns
   - B-tree indexes for foreign keys
   - Unique index on email

2. **Array Operations:**
   - Efficient ANY() checks for permissions
   - Array containment for sharing lists

3. **JSON Storage:**
   - JSONB for flexible preferences
   - Indexed access to preferences

4. **Real-time Updates:**
   - Efficient change notifications
   - Optimized subscription filters