import { supabaseAuthProvider } from 'ra-supabase';
import { supabase } from './supabase';

export const authProvider = supabaseAuthProvider(supabase, {
    // getIdentity: async user => {
    //     const { data, error } = await supabase
    //         .from('sales')
    //         .select('id, first_name, last_name')
    //         .ilike('email', user.email as string)
    //         .single();

    //     if (!data || error) {
    //         throw new Error();
    //     }
    //     return {
    //         id: data.id,
    //         fullName: `${data.first_name} ${data.last_name}`,
    //     };
    // },
    getIdentity: async () => Promise.resolve(),
    checkAuth: async () => Promise.resolve(),
    getPermissions: async () => Promise.resolve(),
    handleCallback: async () => Promise.resolve(),
    checkError: async () => Promise.resolve(),
    logout: async () => Promise.resolve(),
    resetPassword: async () => Promise.resolve(),
    setPassword: async () => Promise.resolve(),
    login: async () => Promise.resolve(),
});
