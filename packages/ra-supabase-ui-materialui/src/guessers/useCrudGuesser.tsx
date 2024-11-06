import { useMemo } from 'react';
import { useAPISchema } from 'ra-supabase-core';
import type { ResourceProps } from 'react-admin';

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
        let edit, show, create, list;
        const resourceNames = Object.keys(schema.definitions!);
        return resourceNames.map(name => {
            const resourcePaths = schema.paths[`/${name}`] ?? {};
            if (resourcePaths.get) {
                list = ListGuesser;
                show = ShowGuesser;
            }
            if (resourcePaths.post) {
                create = CreateGuesser;
            }
            if (resourcePaths.patch) {
                edit = EditGuesser;
            }
            return {
                name,
                list,
                show,
                edit,
                create,
            };
        });
    }, [schema, isPending, error]);
};
