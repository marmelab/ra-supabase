import { DataProvider } from 'ra-core';
import { SupabaseClient } from '@supabase/supabase-js';

export const supabaseDataProvider = (
    client: SupabaseClient,
    resources: ResourcesOptions
): DataProvider => ({
    getList: async (resource, params) => {
        return getList({ client, resources, resource, params });
    },
    getOne: async (resource, { id }) => {
        const resourceOptions = resources[resource];
        const fields = Array.isArray(resourceOptions)
            ? resourceOptions
            : resourceOptions.fields;

        const { data, error } = await client
            .from(resource)
            .select(fields.join(', '))
            .match({ id })
            .single();

        if (error) {
            throw error;
        }
        return { data };
    },
    getMany: async (resource, { ids }) => {
        const resourceOptions = resources[resource];
        const fields = Array.isArray(resourceOptions)
            ? resourceOptions
            : resourceOptions.fields;

        const { data, error } = await client
            .from(resource)
            .select(fields.join(', '))
            .in('id', ids);

        if (error) {
            throw error;
        }
        return { data: data ?? [] };
    },
    getManyReference: async (resource, originalParams) => {
        const { target, id } = originalParams;
        const params = {
            ...originalParams,
            filter: { ...originalParams.filter, [target]: id },
        };
        return getList({ client, resources, resource, params });
    },
    create: async (resource, { data }) => {
        const { data: record, error } = await client
            .from(resource)
            .insert(data)
            .single();

        if (error) {
            throw error;
        }
        return { data: record };
    },
    update: async (resource, { id, data }) => {
        const { data: record, error } = await client
            .from(resource)
            .update(data)
            .match({ id })
            .single();

        if (error) {
            throw error;
        }
        return { data: record };
    },
    updateMany: async (resource, { ids, data }) => {
        const { data: records, error } = await client
            .from(resource)
            .update(data)
            .in('id', ids);

        if (error) {
            throw error;
        }
        return { data: records?.map(record => record.id) };
    },
    delete: async (resource, { id }) => {
        const { data: record, error } = await client
            .from(resource)
            .delete()
            .match({ id })
            .single();

        if (error) {
            throw error;
        }
        return { data: record };
    },
    deleteMany: async (resource, { ids }) => {
        const { data: records, error } = await client
            .from(resource)
            .delete()
            .match({ id: ids });

        if (error) {
            throw error;
        }
        return { data: records?.map(record => record.id) };
    },
});

type ResourceOptionsWithFullTextSearch = {
    fields: string[];
    fullTextSearchFields: string[];
};
export type ResourceOptions = string[] | ResourceOptionsWithFullTextSearch;
export type ResourcesOptions = Record<string, ResourceOptions>;

const getList = async ({ client, resources, resource, params }) => {
    const {
        pagination,
        sort,
        filter: { q, ...filter },
    } = params;

    const resourceOptions = resources[resource];
    const fields = Array.isArray(resourceOptions)
        ? resourceOptions
        : resourceOptions.fields;

    const rangeFrom = (pagination.page - 1) * pagination.perPage;
    const rangeTo = rangeFrom + pagination.perPage;

    let query = client
        .from(resource)
        .select(fields.join(', '), { count: 'exact' })
        .order(sort.field, { ascending: sort.order === 'ASC' })
        .match(filter)
        .range(rangeFrom, rangeTo);

    if (q) {
        const fullTextSearchFields = Array.isArray(resourceOptions)
            ? resourceOptions
            : resourceOptions.fullTextSearchFields;

        query = query.or(
            fullTextSearchFields.map(field => `${field}.ilike.%${q}%`).join(',')
        );
    }

    const { data, error, count } = await query;

    if (error) {
        throw error;
    }
    return { data: data ?? [], total: count ?? 0 };
};
