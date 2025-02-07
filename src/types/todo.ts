import { Database } from './supabase';

export type Todo = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];