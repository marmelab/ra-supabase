import { useDataProvider } from 'react-admin';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { OpenAPIV2 } from 'openapi-types';

export const useAPISchema = ({
    options,
}: {
    options?: Partial<UseQueryOptions<OpenAPIV2.Document>>;
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
