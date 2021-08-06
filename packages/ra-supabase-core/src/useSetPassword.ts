import { useAuthProvider, useLogout, useNotify, useRedirect } from 'ra-core';
import { SetPasswordParams, SupabaseAuthProvider } from './authProvider';

/**
 * This hook returns a function to call in order to set a user password on Supabase.
 **/
export const useSetPassword = ({
    signOutOnSuccess = false,
    redirectTo = '/',
} = {}) => {
    const notify = useNotify();
    const logout = useLogout();
    const redirect = useRedirect();
    const authProvider = useAuthProvider() as SupabaseAuthProvider;

    return (params: SetPasswordParams) => {
        authProvider
            .setPassword(params)
            .then(() => {
                if (signOutOnSuccess) {
                    return logout();
                }
                return redirect(redirectTo);
            })
            .catch(error => {
                notify(error.message, 'error');
            });
    };
};
