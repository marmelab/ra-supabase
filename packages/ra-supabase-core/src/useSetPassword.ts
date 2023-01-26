import {
    onError,
    OnSuccess,
    useAuthProvider,
    useNotify,
    useRedirect,
} from 'ra-core';
import { SetPasswordParams, SupabaseAuthProvider } from './authProvider';

/**
 * This hook returns a function to call in order to set a user password on Supabase.
 *
 * @example
 * import { useSupabaseAccessToken } from 'ra-supabase-core';
 *
 * const SetPasswordPage = () => {
 *     const access_token = useSupabaseAccessToken();
 *     const setPassword = useSetPassword();
 *
 *     const handleSubmit = event => {
 *         setPassword({
 *             access_token,
 *             password: event.currentTarget.elements.password.value,
 *         });
 *     };
 *
 *     return (
 *         <form onSubmit={handleSubmit}>
 *             <label for="password">Choose a password:</label>
 *             <input id="password" name="password" type="password" />
 *             <button type="submit">Save</button>
 *         </form>
 *     );
 * };
 **/
export const useSetPassword = (options?: UseSetPasswordOptions) => {
    const notify = useNotify();
    const redirect = useRedirect();
    const authProvider = useAuthProvider() as SupabaseAuthProvider;

    const {
        onSuccess = () => redirect('/'),
        onFailure = error => notify(error.message, { type: 'error' }),
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
    onFailure?: onError;
};
