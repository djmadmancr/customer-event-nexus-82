
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extender el tipo User de Supabase para incluir uid como alias de id
export interface ExtendedUser extends SupabaseUser {
  uid: string;
}

export const extendUser = (user: SupabaseUser | null): ExtendedUser | null => {
  if (!user) return null;
  return {
    ...user,
    uid: user.id
  };
};
