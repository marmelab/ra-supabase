import {
    OnError,
    OnSuccess,
    useAuthProvider,
    useNotify,
    useRedirect,
} from 'ra-core';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
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
    const redirect = useRedirect();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    if (authProvider == null) {
        throw new Error(
            'No authProvider found. Did you forget to set up an AuthProvider on the <Admin> component?'
        );
    }

    if (authProvider.resetPassword == null) {
        throw new Error(
            'The setPassword() method is missing from the AuthProvider although it is required. You may consider adding it'
        );
    }

    const {
        onSuccess = () => {
            redirect('/login');
            notify('ra-supabase.auth.password_reset', { type: 'info' });
        },
        onError = error => notify(error.message, { type: 'error' }),
    } = options || {};

    const mutation = useMutation<unknown, Error, ResetPasswordParams>({
        mutationFn: params => {
            return authProvider.resetPassword(params);
        },
        onSuccess,
        onError,
        retry: false,
    });

    return [mutation.mutate, mutation];
};

export type UseResetPasswordOptions = {
    onSuccess?: OnSuccess;
    onError?: OnError;
};
