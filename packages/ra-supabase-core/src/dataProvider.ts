import { DataProvider, GetListParams } from 'ra-core';
import { SupabaseClient } from '@supabase/supabase-js';

export const supabaseDataProvider = (
    client: SupabaseClient,
    resources: ResourcesOptions
): DataProvider => ({
    getList: async (resource, params) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        return getList({ client, resource, resourceOptions, params });
    },
    getOne: async (resource, { id }) => {
        const resourceOptions = getResourceOptions(resources[resource]);

        const { data, error } = await client
            .from(resource)
            .select(resourceOptions.fields.join(', '))
            .match({ id })
            .single();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data };
        }

        return { ...data, id: data[resourceOptions.primaryKey] };
    },
    getMany: async (resource, { ids }) => {
        const resourceOptions = getResourceOptions(resources[resource]);

        const { data, error } = await client
            .from(resource)
            .select(resourceOptions.fields.join(', '))
            .in('id', ids);

        if (error) {
            throw error;
        }
        return { data: data ?? [] };
    },
    getManyReference: async (resource, originalParams) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { target, id } = originalParams;
        const params = {
            ...originalParams,
            filter: { ...originalParams.filter, [target]: id },
        };
        return getList({ client, resource, resourceOptions, params });
    },
    create: async (resource, { data }) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { data: record, error } = await client
            .from(resource)
            .insert(data)
            .single();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data: record };
        }

        return { ...record, id: record[resourceOptions.primaryKey] };
    },
    update: async (resource, { id, data }) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { data: record, error } = await client
            .from(resource)
            .update(data)
            .match({ id })
            .single();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data: record };
        }

        return { ...record, id: record[resourceOptions.primaryKey] };
    },
    updateMany: async (resource, { ids, data }) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { data: records, error } = await client
            .from(resource)
            .update(data)
            .in('id', ids);

        if (error) {
            throw error;
        }
        return {
            data: records?.map(record => record[resourceOptions.primaryKey]),
        };
    },
    delete: async (resource, { id }) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { data: record, error } = await client
            .from(resource)
            .delete()
            .match({ id })
            .single();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data: record };
        }

        return { ...record, id: record[resourceOptions.primaryKey] };
    },
    deleteMany: async (resource, { ids }) => {
        const resourceOptions = getResourceOptions(resources[resource]);
        const { data: records, error } = await client
            .from(resource)
            .delete()
            .in('id', ids);

        if (error) {
            throw error;
        }
        return {
            data: records?.map(record => record[resourceOptions.primaryKey]),
        };
    },
});

type ResourceOptionsWithFullTextSearch = {
    primaryKey?: string;
    fields: string[];
    fullTextSearchFields?: string[];
};

type InternalResourceOptions = Required<ResourceOptionsWithFullTextSearch>;

export type ResourceOptions = string[] | ResourceOptionsWithFullTextSearch;
export type ResourcesOptions = Record<string, ResourceOptions>;

const getList = async ({
    client,
    resource,
    resourceOptions,
    params,
}: {
    client: SupabaseClient;
    resource: string;
    resourceOptions: InternalResourceOptions;
    params: GetListParams;
}) => {
    const {
        pagination,
        sort,
        filter: { q, ...filter },
    } = params;

    const rangeFrom = (pagination.page - 1) * pagination.perPage;
    const rangeTo = rangeFrom + pagination.perPage;

    let query = client
        .from(resource)
        .select(resourceOptions.fields.join(', '), { count: 'exact' })
        .order(sort.field, { ascending: sort.order === 'ASC' })
        .match(filter)
        .range(rangeFrom, rangeTo);

    if (q) {
        query = query.or(
            resourceOptions.fullTextSearchFields
                .map(field => `${field}.ilike.%${q}%`)
                .join(',')
        );
    }

    const { data, error, count } = await query;

    if (error) {
        throw error;
    }
    return {
        data:
            resourceOptions.primaryKey === 'id'
                ? data
                : data.map(item => ({
                      ...item,
                      id: item[resourceOptions.primaryKey],
                  })) ?? [],
        total: count ?? 0,
    };
};

const getResourceOptions = (
    options: ResourceOptions
): InternalResourceOptions => {
    if (Array.isArray(options)) {
        return {
            primaryKey: 'id',
            fields: options,
            fullTextSearchFields: options,
        };
    }

    return {
        primaryKey: options.primaryKey ?? 'id',
        fields: options.fields,
        fullTextSearchFields: options.fullTextSearchFields ?? options.fields,
    };
};
