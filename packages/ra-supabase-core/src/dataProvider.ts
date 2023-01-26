import { DataProvider, GetListParams, RaRecord } from 'ra-core';
import { SupabaseClient } from '@supabase/supabase-js';

export const supabaseDataProvider = (
    client: SupabaseClient,
    resources: ResourcesOptions
): DataProvider => ({
    getList: async <RecordType>(resource, params) => {
        const resourceOptions = getResourceOptions(resource, resources);
        return getList<RecordType>({
            client,
            resource,
            resourceOptions,
            params,
        });
    },
    getOne: async <RecordType>(resource, { id }) => {
        const resourceOptions = getResourceOptions(resource, resources);

        const { data, error } = await client
            .from(resourceOptions.table)
            .select(resourceOptions.fields.join(', '))
            .match({ id })
            .maybeSingle();

        if (error) {
            throw error;
        }

        // There is a bug in supabase-js
        // See https://github.com/supabase/supabase-js/issues/551
        const record = data as unknown as RecordType;
        if (resourceOptions.primaryKey === 'id') {
            return { data: record };
        }

        return { data: { ...record, id: data[resourceOptions.primaryKey] } };
    },
    getMany: async <RecordType>(resource, { ids }) => {
        const resourceOptions = getResourceOptions(resource, resources);

        const { data, error } = await client
            .from(resourceOptions.table)
            .select(resourceOptions.fields.join(', '))
            .in('id', ids);

        if (error) {
            throw error;
        }

        // There is a bug in supabase-js
        // See https://github.com/supabase/supabase-js/issues/551
        const records = data as unknown as RecordType[];
        return { data: records ?? [] };
    },
    getManyReference: async <RecordType>(resource, originalParams) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { target, id } = originalParams;
        const params = {
            ...originalParams,
            filter: { ...originalParams.filter, [target]: id },
        };
        return getList<RecordType>({
            client,
            resource,
            resourceOptions,
            params,
        });
    },
    create: async (resource, { data }) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { data: record, error } = await client
            .from(resourceOptions.table)
            .insert(data)
            .select()
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data };
        }

        return { data: { ...record, id: record[resourceOptions.primaryKey] } };
    },
    update: async (resource, { id, data }) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { data: record, error } = await client
            .from(resourceOptions.table)
            .update(data)
            .match({ id })
            .select()
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (resourceOptions.primaryKey === 'id') {
            return { data: record };
        }

        return { data: { ...record, id: record[resourceOptions.primaryKey] } };
    },
    updateMany: async (resource, { ids, data }) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { data: records, error } = await client
            .from(resourceOptions.table)
            .update(data)
            .in('id', ids)
            .select();

        if (error) {
            throw error;
        }
        return {
            data: records?.map(record => record[resourceOptions.primaryKey]),
        };
    },
    delete: async (resource, { id, previousData }) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { error } = await client
            .from(resourceOptions.table)
            .delete()
            .match({ id });

        if (error) {
            throw error;
        }

        return { data: previousData };
    },
    deleteMany: async (resource, { ids }) => {
        const resourceOptions = getResourceOptions(resource, resources);
        const { error } = await client
            .from(resourceOptions.table)
            .delete()
            .in('id', ids);

        if (error) {
            throw error;
        }
        return {
            data: ids,
        };
    },
});

type ResourceOptionsWithFullTextSearch = {
    table?: string;
    primaryKey?: string;
    fields: string[];
    fullTextSearchFields?: string[];
};

type InternalResourceOptions = Required<ResourceOptionsWithFullTextSearch>;

export type ResourceOptions = string[] | ResourceOptionsWithFullTextSearch;
export type ResourcesOptions = Record<string, ResourceOptions>;

const getList = async <RecordType>({
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
        .from(resourceOptions.table)
        .select(resourceOptions.fields.join(', '), { count: 'exact' })
        .order(sort.field, { ascending: sort.order === 'ASC' })
        .match(filter)
        .range(rangeFrom, rangeTo);

    if (q) {
        const fullTextSearchFields = Array.isArray(resourceOptions)
            ? resourceOptions
            : resourceOptions.fullTextSearchFields;

        fullTextSearchFields.forEach(field => {
            query = query.ilike(field, `%${q}%`);
        });
    }

    const { data, error, count } = await query;
    // There is a bug in supabase-js
    // See https://github.com/supabase/supabase-js/issues/551
    const records = data as unknown as RecordType[];
    if (error) {
        throw error;
    }
    return {
        data:
            resourceOptions.primaryKey === 'id'
                ? records
                : records.map(item => ({
                      ...item,
                      id: item[resourceOptions.primaryKey],
                  })) ?? [],
        total: count ?? 0,
    };
};

const getResourceOptions = (
    resource: string,
    options: ResourcesOptions
): InternalResourceOptions => {
    const resourceOptions = options[resource];

    if (Array.isArray(resourceOptions)) {
        return {
            table: resource,
            primaryKey: 'id',
            fields: resourceOptions,
            fullTextSearchFields: resourceOptions,
        };
    }

    return {
        table: resourceOptions.table ?? resource,
        primaryKey: resourceOptions.primaryKey ?? 'id',
        fields: resourceOptions.fields,
        fullTextSearchFields:
            resourceOptions.fullTextSearchFields ?? resourceOptions.fields,
    };
};
