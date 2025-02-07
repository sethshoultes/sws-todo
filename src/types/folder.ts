import { Database } from './supabase';

export type Folder = Database['public']['Tables']['todo_folders']['Row'];
export type FolderInsert = Database['public']['Tables']['todo_folders']['Insert'];
export type FolderUpdate = Database['public']['Tables']['todo_folders']['Update'];

export type Permission = 'view' | 'edit' | 'manage';