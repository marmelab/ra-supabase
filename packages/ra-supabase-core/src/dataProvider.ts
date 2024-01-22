import { DataProvider, fetchUtils } from 'ra-core';
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
 * @returns A dataProvider for Supabase
 */
export const supabaseDataProvider = ({
    instanceUrl,
    apiKey,
    supabaseClient,
}: {
    instanceUrl: string;
    apiKey: string;
    supabaseClient: SupabaseClient;
}): DataProvider => {
    const config: IDataProviderConfig = {
        apiUrl: `${instanceUrl}/rest/v1`,
        httpClient: supabaseHttpClient({ apiKey, supabaseClient }),
        defaultListOp: 'eq',
        primaryKeys: defaultPrimaryKeys,
        schema: defaultSchema,
    };
    return postgrestRestProvider(config);
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
            // This ensures the app is authorized to access the supabase instance
            options.headers.set('apiKey', apiKey);
        }
        return fetchUtils.fetchJson(url, options);
    };
