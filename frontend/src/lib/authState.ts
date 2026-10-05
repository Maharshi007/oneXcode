import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return user
}