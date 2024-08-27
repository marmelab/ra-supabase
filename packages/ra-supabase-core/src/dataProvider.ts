import { DataProvider, fetchUtils, withLifecycleCallbacks } from 'ra-core';
import postgrestRestProvider, {
    IDataProviderConfig,
    defaultPrimaryKeys,
    defaultSchema,
} from '@raphiniert/ra-data-postgrest';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * A function that returns a dataProvider for Supabase.
 * @param instanceUrl The URL of the Supabase instance
 * @param apiKey The API key of the Supabase instance. Prefer the anonymous key.
 * @param supabaseClient The Supabase client
 * @param defaultListOp Optional - The default list filter operator. Defaults to 'eq'.
 * @param primaryKeys Optional - The primary keys of the tables. Defaults to 'id'.
 * @param schema Optional - The custom schema to use. Defaults to none.
 * @returns A dataProvider for Supabase
 */
export const supabaseDataProvider = ({
    instanceUrl,
    apiKey,
    supabaseClient,
    httpClient = supabaseHttpClient({ apiKey, supabaseClient }),
    defaultListOp = 'eq',
    primaryKeys = defaultPrimaryKeys,
    schema = defaultSchema,
    storagePath,
    filenameFromData = ({ filename }) => filename,
}: {
    instanceUrl: string;
    apiKey: string;
    supabaseClient: SupabaseClient;
    storagePath?: string | ((resource: string) => string);
    filenameFromData?: (_: {
        data: string;
        resource: string;
        field: string;
        filename: string;
    }) => string;
} & Partial<Omit<IDataProviderConfig, 'apiUrl'>>): DataProvider => {
    const config: IDataProviderConfig = {
        apiUrl: `${instanceUrl}/rest/v1`,
        httpClient,
        defaultListOp,
        primaryKeys,
        schema,
    };
    return withLifecycleCallbacks(postgrestRestProvider(config), [
        {
            resource: '*',
            beforeSave: async (
                data: any,
                dataProvider: DataProvider,
                resource: string
            ) => {
                if (!storagePath) return data;
                const newFiles = (
                    await Promise.all(
                        Object.keys(data)
                            .filter(key => data[key]?.rawFile instanceof File)
                            .map(async (key: string) => {
                                const file = data[key];
                                const bucket =
                                    storagePath instanceof Function
                                        ? storagePath(resource)
                                        : storagePath;
                                const filename = filenameFromData({
                                    data,
                                    resource,
                                    field: key,
                                    filename: file.rawFile.name,
                                });

                                const { error } = await supabaseClient.storage
                                    .from(bucket)
                                    .upload(filename, file.rawFile);
                                if (error) throw error;
                                const {
                                    data: { publicUrl },
                                } = supabaseClient.storage
                                    .from(bucket)
                                    .getPublicUrl(filename);

                                return { [key]: publicUrl };
                            })
                    )
                ).reduce((acc, val) => ({ ...acc, ...val }), {});
                return { ...data, ...newFiles };
            },
        },
    ]);
};

/**
 * A function that returns a httpClient for Supabase. It handles the authentication.
 * @param apiKey The API key of the Supabase instance. Prefer the anonymous key.
 * @param supabaseClient The Supabase client
 * @returns A httpClient for Supabase
 */
export const supabaseHttpClient =
    ({
        apiKey,
        supabaseClient,
    }: {
        apiKey: string;
        supabaseClient: SupabaseClient;
    }) =>
    async (url: string, options: any = {}) => {
        const { data } = await supabaseClient.auth.getSession();
        if (!options.headers) options.headers = new Headers({});

        if (supabaseClient['headers']) {
            Object.entries(supabaseClient['headers']).forEach(([name, value]) =>
                options.headers.set(name, value)
            );
        }
        if (data.session) {
            options.user = {
                authenticated: true,
                // This ensures that users are identified correctly and that RLS can be applied
                token: `Bearer ${data.session.access_token}`,
            };
        }
        // Always send the apiKey even if there isn't a session
        options.headers.set('apiKey', apiKey);

        return fetchUtils.fetchJson(url, options);
    };
