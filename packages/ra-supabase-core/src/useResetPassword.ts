import { onError, OnSuccess, useAuthProvider, useNotify } from 'ra-core';
import { useMutation, UseMutationResult } from 'react-query';
import { ResetPasswordParams, SupabaseAuthProvider } from './authProvider';

/**
 * This hook returns a function to call in order to reset a user password on Supabase.
 *
 * @example
 * import { useSupabaseAccessToken } from 'ra-supabase-core';
 *
 * const ResetPasswordPage = () => {
 *     const [resetPassword] = useResetPassword();
 *
 *     const handleSubmit = event => {
 *         resetPassword({
 *             email: event.currentTarget.elements.email.value,
 *         });
 *     };
 *
 *     return (
 *         <form onSubmit={handleSubmit}>
 *             <label for="email">Email:</label>
 *             <input id="email" name="email" type="email" />
 *             <button type="submit">Reset password</button>
 *         </form>
 *     );
 * };
 **/
export const useResetPassword = (
    options?: UseResetPasswordOptions
): [
    UseMutationResult<unknown, Error, ResetPasswordParams>['mutate'],
    UseMutationResult<unknown, Error, ResetPasswordParams>
] => {
    const notify = useNotify();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    const {
        onSuccess = () => {
            notify('ra-supabase.auth.password_reset', { type: 'info' });
        },
        onError = error => notify(error.message, { type: 'error' }),
    } = options || {};

    const mutation = useMutation<unknown, Error, ResetPasswordParams>(
        params => {
            return authProvider.resetPassword(params);
        },
        { onSuccess, onError, retry: false }
    );

    return [mutation.mutate, mutation];
};

export type UseResetPasswordOptions = {
    onSuccess?: OnSuccess;
    onError?: onError;
};
