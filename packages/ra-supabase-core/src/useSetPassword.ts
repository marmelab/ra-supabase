import {
    onError,
    OnSuccess,
    useAuthProvider,
    useNotify,
    useRedirect,
} from 'ra-core';
import { useMutation, UseMutationResult } from 'react-query';
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
export const useSetPassword = (
    options?: UseSetPasswordOptions
): [
    UseMutationResult<unknown, Error, SetPasswordParams>['mutate'],
    UseMutationResult<unknown, Error, SetPasswordParams>
] => {
    const notify = useNotify();
    const redirect = useRedirect();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    const {
        onSuccess = () => redirect('/'),
        onError = error => notify(error.message, { type: 'error' }),
    } = options || {};

    const mutation = useMutation<unknown, Error, SetPasswordParams>(
        params => {
            return authProvider.setPassword(params);
        },
        { onSuccess, onError, retry: false }
    );

    return [mutation.mutate, mutation];
};

export type UseSetPasswordOptions = {
    onSuccess?: OnSuccess;
    onError?: onError;
};
