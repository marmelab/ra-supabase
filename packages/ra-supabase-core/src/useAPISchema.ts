import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { OpenAPIV2 } from 'openapi-types';
import { useDataProvider } from 'ra-core';

export const useAPISchema = ({
    options,
}: {
    options?: Partial<
        Omit<UseQueryOptions<OpenAPIV2.Document>, 'queryKey' | 'queryFn'>
    >;
} = {}) => {
    const dataProvider = useDataProvider();
    if (!dataProvider.getSchema) {
        throw new Error(
            "The data provider doesn't have access to the database schema"
        );
    }
    return useQuery<OpenAPIV2.Document>({
        queryKey: ['getSchema'],
        queryFn: () => dataProvider.getSchema() as Promise<OpenAPIV2.Document>,
        staleTime: 1000 * 60, // 1 minute
        ...options,
    });
};
