import { useMemo } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import type { ResourceProps } from 'ra-core';

import { ListGuesser } from './ListGuesser';
import { CreateGuesser } from './CreateGuesser';
import { EditGuesser } from './EditGuesser';
import { ShowGuesser } from './ShowGuesser';

export const useCrudGuesser = () => {
    const { data: schema, error, isPending } = useAPISchema();
    return useMemo<ResourceProps[]>(() => {
        if (isPending || error) {
            return [];
        }
        const resourceNames = Object.keys(schema.definitions!);
        return resourceNames.map(name => {
            const resourcePaths = schema.paths[`/${name}`] ?? {};
            return {
                name,
                list: resourcePaths.get ? ListGuesser : undefined,
                show: resourcePaths.get ? ShowGuesser : undefined,
                edit: resourcePaths.patch ? EditGuesser : undefined,
                create: resourcePaths.post ? CreateGuesser : undefined,
            };
        });
    }, [schema, isPending, error]);
};
