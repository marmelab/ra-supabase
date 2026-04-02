import { AdminGuesser } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase-core';
import { LoginPage, LoginForm } from 'ra-supabase-ui-materialui';
import { Typography, Box, Alert } from '@mui/material';

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

const MFALoginPage = () => (
    <LoginPage>
        <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
            <Typography variant="body2">
                This demo enforces Multi-Factor Authentication (TOTP). After
                login, you will be asked to enroll or verify your authenticator
                app.
            </Typography>
        </Alert>
        <LoginForm disableForgotPassword />
        <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
                <strong>Test credentials:</strong>
                <br />
                Email: <code>janedoe@atomic.dev</code>
                <br />
                Password: <code>password</code>
            </Typography>
        </Box>
    </LoginPage>
);

const App = () => (
    <AdminGuesser
        instanceUrl={instanceUrl}
        apiKey={apiKey}
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={<MFALoginPage />}
    />
);

export default App;
