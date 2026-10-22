import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
} from '@tanstack/react-query';
import { useAuthProvider, useNotify } from 'ra-core';
import {
    MFAChallengeAndVerifyParams,
    MFAChallengeAndVerifyResult,
    SupabaseAuthProvider,
} from './authProvider';
import { defaultMFAOnError } from './defaultMFAOnError';

export const useMFAChallengeAndVerify = (
    options?: UseMFAChallengeAndVerifyOptions
): [
    UseMutationResult<
        MFAChallengeAndVerifyResult,
        Error,
        MFAChallengeAndVerifyParams
    >['mutate'],
    UseMutationResult<
        MFAChallengeAndVerifyResult,
        Error,
        MFAChallengeAndVerifyParams
    >
] => {
    const notify = useNotify();
    const authProvider = useAuthProvider<SupabaseAuthProvider>();

    if (authProvider == null) {
        throw new Error(
            'No authProvider found. Did you forget to set up an AuthProvider on the <Admin> component?'
        );
    }

    if (authProvider.mfaChallengeAndVerify == null) {
        throw new Error(
            'The mfaChallengeAndVerify() method is missing from the AuthProvider although it is required. You may consider adding it'
        );
    }

    const { onSuccess, onError = defaultMFAOnError(notify) } = options || {};

    const mutation = useMutation<
        MFAChallengeAndVerifyResult,
        Error,
        MFAChallengeAndVerifyParams
    >({
        mutationFn: params => {
            return authProvider.mfaChallengeAndVerify(params);
        },
        onSuccess,
        onError,
        retry: false,
    });

    return [mutation.mutate, mutation];
};

export type UseMFAChallengeAndVerifyOptions = Pick<
    UseMutationOptions<
        MFAChallengeAndVerifyResult,
        Error,
        MFAChallengeAndVerifyParams
    >,
    'onSuccess' | 'onError'
>;
