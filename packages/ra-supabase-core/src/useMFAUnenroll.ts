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
            'The mfaUnenroll() method is missing from the AuthProvider although it is required. You may consider adding it'
        );
    }

    const {
        onSuccess,
        onError = error =>
            notify(
                typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                    ? 'ra.auth.sign_in_error'
                    : error.message,
                {
                    type: 'error',
                    messageArgs: {
                        _:
                            typeof error === 'string'
                                ? error
                                : error && error.message
                                ? error.message
                                : undefined,
                    },
                }
            ),
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
