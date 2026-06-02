import { DataProvider, fetchUtils } from 'ra-core';
import postgrestRestProvider, {
    IDataProviderConfig,
    defaultPrimaryKeys,
    defaultSchema,
} from '@raphiniert/ra-data-postgrest';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { OpenAPIV2 } from 'openapi-types';

type WithApiKey = {
    instanceUrl: string;
    /**
     * The API key of the Supabase instance. Accepts both the legacy anonymous
     * JWT key and the newer publishable key (`sb_publishable_*`).
     * Either `apiKey` or `supabaseClient` must be provided.
     */
    apiKey: string;
    supabaseClient?: SupabaseClient;
};

type WithSupabaseClient = {
    instanceUrl: string;
    /**
     * A pre-configured Supabase client. Required when `apiKey` is not provided.
     * Use this when you create the client with a publishable key and want to
     * pass it directly without also specifying the key separately.
     */
    supabaseClient: SupabaseClient;
    apiKey?: never;
};

/**
 * A function that returns a dataProvider for Supabase.
 * @param instanceUrl The URL of the Supabase instance
 * @param apiKey The API key of the Supabase instance. Accepts the legacy anonymous JWT key or the newer publishable key (`sb_publishable_*`). Either `apiKey` or `supabaseClient` must be provided.
 * @param supabaseClient The Supabase client. Required when `apiKey` is not provided.
 * @param httpClient Optional - The httpClient to use. Defaults to a httpClient that handles the authentication.
 * @param defaultListOp Optional - The default list filter operator. Defaults to 'eq'.
 * @param primaryKeys Optional - The primary keys of the tables. Defaults to 'id'.
 * @param schema Optional - The custom schema to use. Defaults to none.
 * @returns A dataProvider for Supabase
 */
export const supabaseDataProvider = ({
    instanceUrl,
    apiKey,
    supabaseClient: supabaseClientParam,
    httpClient: httpClientParam,
    defaultListOp = 'eq',
    primaryKeys = defaultPrimaryKeys,
    schema = defaultSchema,
    ...rest
}: (WithApiKey | WithSupabaseClient) &
    Partial<Omit<IDataProviderConfig, 'apiUrl'>>): DataProvider => {
    const supabaseClient =
        supabaseClientParam ??
        (apiKey
            ? createClient(instanceUrl, apiKey)
            : (() => {
                  throw new Error(
                      'Either apiKey or supabaseClient must be provided to supabaseDataProvider'
                  );
              })());
    const httpClient =
        httpClientParam ?? supabaseHttpClient({ apiKey, supabaseClient });

    const config: IDataProviderConfig = {
        apiUrl: `${instanceUrl}/rest/v1`,
        httpClient,
        defaultListOp,
        primaryKeys,
        schema,
        ...rest,
    };
    return {
        supabaseClient: (url: string, options?: any) =>
            httpClient(`${config.apiUrl}/${url}`, options),
        getSchema: async (): Promise<OpenAPIV2.Document> => {
            const { json } = await httpClient(`${config.apiUrl}/`, {});
            if (!json || !json.swagger) {
                throw new Error('The Open API schema is not readable');
            }
            return json;
        },
        ...postgrestRestProvider(config),
    };
};

/**
 * A function that returns a httpClient for Supabase. It handles the authentication.
 * @param apiKey The API key of the Supabase instance. Accepts the legacy anonymous JWT key or the newer publishable key (`sb_publishable_*`). When omitted, the key configured on the `supabaseClient` is used via its internal headers.
 * @param supabaseClient The Supabase client
 * @returns A httpClient for Supabase
 */
export const supabaseHttpClient =
    ({
        apiKey,
        supabaseClient,
    }: {
        apiKey?: string;
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
        // When apiKey is explicitly provided, set it in the header to ensure it
        // takes precedence over the supabaseClient internal headers. When omitted,
        // the key from supabaseClient['headers'] (set by the copy loop above) is
        // used instead — this supports the publishable key format (`sb_publishable_*`)
        // where the supabase-js client manages the key internally.
        if (apiKey !== undefined) {
            options.headers.set('apiKey', apiKey);
        }

        return fetchUtils.fetchJson(url, options);
    };
