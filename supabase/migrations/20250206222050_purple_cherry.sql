/*
  # Complete Database Installation/Recovery File
  
  1. Tables
    - todos: Main todo items table with sharing capabilities
    - todo_folders: Organizes todos into shareable folders
    - todo_profiles: Public user profiles
    - todo_user_preferences: User preferences and todo ordering
  
  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Granular policies for viewing and editing
    - Secure function definitions
  
  3. Features
    - User profile management
    - Folder and todo sharing
    - Preference storage
    - Automatic profile creation
*/

-- Create tables
CREATE TABLE IF NOT EXISTS todo_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todo_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users NOT NULL,
  shared_with uuid[] DEFAULT ARRAY[]::uuid[],
  can_edit uuid[] DEFAULT ARRAY[]::uuid[]
);

CREATE TABLE IF NOT EXISTS todos (
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

CREATE TABLE IF NOT EXISTS todo_user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE todo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_user_preferences ENABLE ROW LEVEL SECURITY;

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create triggers
CREATE TRIGGER update_todo_profiles_updated_at
  BEFORE UPDATE ON todo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_user_preferences_updated_at
  BEFORE UPDATE ON todo_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create policies for todo_profiles
CREATE POLICY "Users can view all profiles"
  ON todo_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON todo_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication trigger"
  ON todo_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for todo_folders
CREATE POLICY "Users can manage their own folders"
  ON todo_folders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Shared users can view folders"
  ON todo_folders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = ANY(shared_with) OR
    auth.uid() = user_id
  );

CREATE POLICY "Users with edit permission can update folders"
  ON todo_folders
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = ANY(can_edit) OR
    auth.uid() = user_id
  );

-- Create policies for todos
CREATE POLICY "Users can manage their own todos"
  ON todos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view todos in shared folders"
  ON todos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(shared_with) OR
    folder_id IN (
      SELECT id FROM todo_folders
      WHERE auth.uid() = ANY(shared_with)
    )
  );

CREATE POLICY "Users can edit todos in shared folders"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = ANY(can_edit) OR
    folder_id IN (
      SELECT id FROM todo_folders
      WHERE auth.uid() = ANY(can_edit)
    )
  );

-- Create policies for todo_user_preferences
CREATE POLICY "Users can manage their own preferences"
  ON todo_user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_folder_id ON todos(folder_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON todo_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_profiles_email ON todo_profiles(email);
CREATE INDEX IF NOT EXISTS idx_todo_folders_shared_with ON todo_folders USING GIN (shared_with);
CREATE INDEX IF NOT EXISTS idx_todo_folders_can_edit ON todo_folders USING GIN (can_edit);
CREATE INDEX IF NOT EXISTS idx_todos_shared_with ON todos USING GIN (shared_with);
CREATE INDEX IF NOT EXISTS idx_todos_can_edit ON todos USING GIN (can_edit);

-- Grant necessary permissions
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name = 'todo_profiles_id_seq'
  ) THEN
    GRANT USAGE, SELECT ON SEQUENCE todo_profiles_id_seq TO authenticated;
  END IF;
END
$$;

-- Add table comments
COMMENT ON TABLE todos IS 'Stores todo items with sharing capabilities';
COMMENT ON TABLE todo_folders IS 'Organizes todos into shareable folders';
COMMENT ON TABLE todo_profiles IS 'Public profiles for users with essential information';
COMMENT ON TABLE todo_user_preferences IS 'Stores user preferences including todo ordering';

COMMENT ON COLUMN todos.shared_with IS 'Array of user IDs who can view this todo';
COMMENT ON COLUMN todos.can_edit IS 'Array of user IDs who can edit this todo';
COMMENT ON COLUMN todo_folders.shared_with IS 'Array of user IDs who can view this folder';
COMMENT ON COLUMN todo_folders.can_edit IS 'Array of user IDs who can edit this folder';