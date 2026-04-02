import { AdminGuesser } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import {
    supabaseDataProvider,
    supabaseAuthProvider,
} from 'ra-supabase-core';

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);

const dataProvider = supabaseDataProvider({
    instanceUrl,
    apiKey,
    supabaseClient,
});

const authProvider = supabaseAuthProvider(supabaseClient, {
    enforceMFA: true,
    mfaAppFriendlyName: 'CRM Demo',
});

const App = () => (
    <AdminGuesser
        instanceUrl={instanceUrl}
        apiKey={apiKey}
        dataProvider={dataProvider}
        authProvider={authProvider}
    />
);

export default App;
