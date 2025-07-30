import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import { useAuthProvider, useNotify } from 'ra-core';
import { MFAListFactorsResult, SupabaseAuthProvider } from './authProvider';

export const useMFAListFactors = (
    options?: UseMFAListFactorsOptions
): [
    UseMutationResult<MFAListFactorsResult, Error, void>['mutate'],
    UseMutationResult<MFAListFactorsResult, Error, void>
] => {
    const notify = useNotify();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    if (authProvider == null) {
        throw new Error(
            'No authProvider found. Did you forget to set up an AuthProvider on the <Admin> component?'
        );
    }

    if (authProvider.mfaListFactors == null) {
        throw new Error(
            'The mfaListFactors() method is missing from the AuthProvider although it is required. You may consider adding it'
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

    const mutation = useMutation<MFAListFactorsResult, Error, void>({
        mutationFn: () => {
            return authProvider.mfaListFactors();
        },
        onSuccess,
        onError,
        retry: false,
    });

    return [mutation.mutate, mutation];
};

export type UseMFAListFactorsOptions = Pick<
    UseMutationOptions<MFAListFactorsResult, Error, void>,
    'onSuccess' | 'onError'
>;
