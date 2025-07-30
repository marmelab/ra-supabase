import { useQuery } from '@tanstack/react-query';
import { useAuthProvider } from 'ra-core';
import { MFAListFactorsResult, SupabaseAuthProvider } from './authProvider';

export const useMFAListFactors = () => {
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

    const query = useQuery<MFAListFactorsResult>({
        queryKey: ['mfaListFactors'],
        queryFn: () => {
            return authProvider.mfaListFactors();
        },
    });

    return query;
};
