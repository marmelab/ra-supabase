import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import { useAuthProvider, useNotify } from 'ra-core';
import {
    MFAUnenrollResult,
    MFAUnenrollParams,
    SupabaseAuthProvider,
} from './authProvider';

export const useMFAUnenroll = (
    options?: UseMFAUnenrollOptions
): [
    UseMutationResult<MFAUnenrollResult, Error, MFAUnenrollParams>['mutate'],
    UseMutationResult<MFAUnenrollResult, Error, MFAUnenrollParams>
] => {
    const notify = useNotify();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    if (authProvider == null) {
        throw new Error(
            'No authProvider found. Did you forget to set up an AuthProvider on the <Admin> component?'
        );
    }

    if (authProvider.mfaUnenroll == null) {
        throw new Error(
            'useMFAUnenroll requires authProvider.mfaUnenroll(). Use supabaseAuthProvider() from ra-supabase-core, or implement mfaUnenroll in your authProvider.'
        );
    }

    const {
        onSuccess,
        onError = error => notify(error.message, { type: 'error' }),
    } = options || {};

    const mutation = useMutation<MFAUnenrollResult, Error, MFAUnenrollParams>({
        mutationFn: params => {
            return authProvider.mfaUnenroll(params);
        },
        onSuccess,
        onError,
        retry: false,
    });

    return [mutation.mutate, mutation];
};

export type UseMFAUnenrollOptions = Pick<
    UseMutationOptions<MFAUnenrollResult, Error, MFAUnenrollParams>,
    'onSuccess' | 'onError'
>;
