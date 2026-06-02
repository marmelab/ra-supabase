import { AdminGuesser } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase-core';
import { LoginPage, LoginForm } from 'ra-supabase-ui-materialui';
import {
    Typography,
    Box,
    Alert,
    Button,
    Card,
    CardContent,
    CardActions,
    Container,
    Stack,
} from '@mui/material';

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);

const dataProvider = supabaseDataProvider({
    instanceUrl,
    apiKey,
    supabaseClient,
});

const standardAuthProvider = supabaseAuthProvider(supabaseClient, {});

const mfaAuthProvider = supabaseAuthProvider(supabaseClient, {
    enforceMFA: true,
    mfaAppFriendlyName: 'CRM Demo',
});

type DemoMode = 'standard' | 'mfa';

const getMode = (): DemoMode | null => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'standard' || mode === 'mfa') return mode;
    return null;
};

const setMode = (mode: DemoMode) => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);
    url.pathname = '/login';
    window.location.href = url.toString();
};

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

const HomePage = () => (
    <Box
        sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fafafa',
        }}
    >
        <Container maxWidth="md">
            <Typography variant="h3" align="center" gutterBottom>
                ra-supabase Demo
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                sx={{ mb: 4 }}
            >
                Choose a login strategy to explore
            </Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
            >
                <Card sx={{ flex: 1, maxWidth: 400 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Standard Login
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email and password authentication without
                            multi-factor authentication.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="contained"
                            onClick={() => setMode('standard')}
                        >
                            Enter
                        </Button>
                    </CardActions>
                </Card>
                <Card sx={{ flex: 1, maxWidth: 400 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            MFA Login (TOTP)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Email and password authentication with enforced
                            multi-factor authentication using TOTP.
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            variant="contained"
                            onClick={() => setMode('mfa')}
                        >
                            Enter
                        </Button>
                    </CardActions>
                </Card>
            </Stack>
        </Container>
    </Box>
);

const mode = getMode();

const App = () => {
    if (mode === 'standard') {
        return (
            <AdminGuesser
                instanceUrl={instanceUrl}
                apiKey={apiKey}
                dataProvider={dataProvider}
                authProvider={standardAuthProvider}
            />
        );
    }

    if (mode === 'mfa') {
        return (
            <AdminGuesser
                instanceUrl={instanceUrl}
                apiKey={apiKey}
                dataProvider={dataProvider}
                authProvider={mfaAuthProvider}
                loginPage={<MFALoginPage />}
            />
        );
    }

    return <HomePage />;
};

export default App;
