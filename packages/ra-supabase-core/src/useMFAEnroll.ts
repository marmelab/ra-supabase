import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import { useAuthProvider, useNotify } from 'ra-core';
import { MFAEnrollResult, SupabaseAuthProvider } from './authProvider';

export const useMFAEnroll = (
    options?: UseMFAEnrollOptions
): [
    UseMutationResult<MFAEnrollResult, Error, void>['mutate'],
    UseMutationResult<MFAEnrollResult, Error, void>
] => {
    const notify = useNotify();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    if (authProvider == null) {
        throw new Error(
            'No authProvider found. Did you forget to set up an AuthProvider on the <Admin> component?'
        );
    }

    if (authProvider.mfaEnroll == null) {
        throw new Error(
            'The mfaEnroll() method is missing from the AuthProvider although it is required. You may consider adding it'
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

    const mutation = useMutation<MFAEnrollResult, Error, void>({
        mutationFn: () => {
            return authProvider.mfaEnroll({ factorType: 'totp' });
        },
        onSuccess,
        onError,
        retry: false,
    });

    return [mutation.mutate, mutation];
};

export type UseMFAEnrollOptions = Pick<
    UseMutationOptions<MFAEnrollResult, Error, void>,
    'onSuccess' | 'onError'
>;
