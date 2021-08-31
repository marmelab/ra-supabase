import {
    OnFailure,
    OnSuccess,
    useAuthProvider,
    useNotify,
    useRedirect,
} from 'ra-core';
import { SetPasswordParams, SupabaseAuthProvider } from './authProvider';

/**
 * This hook returns a function to call in order to set a user password on Supabase.
 **/
export const useSetPassword = (options?: UseSetPasswordOptions) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const authProvider = useAuthProvider() as SupabaseAuthProvider;

    const {
        onSuccess = () => redirect('/'),
        onFailure = error => notify(error.message, 'error'),
    } = options || {};

    return (params: SetPasswordParams) => {
        authProvider
            .setPassword(params)
            .then(() => {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch(error => {
                if (onFailure) {
                    onFailure(error);
                }
            });
    };
};

export type UseSetPasswordOptions = {
    onSuccess?: OnSuccess;
    onFailure?: OnFailure;
};
