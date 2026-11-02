import { forwardRef, ReactNode } from 'react';
import { AdminGuesser } from 'ra-supabase';
import { createClient } from '@supabase/supabase-js';
import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase-core';
import { LoginPage, LoginForm } from 'ra-supabase-ui-materialui';
import {
    AppBar,
    Layout,
    LayoutProps,
    Logout,
    UserMenu,
    useUserMenu,
} from 'react-admin';
import {
    Typography,
    Box,
    Alert,
    Button,
    Card,
    CardContent,
    CardActions,
    Container,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Stack,
} from '@mui/material';
import PhonelinkLockIcon from '@mui/icons-material/PhonelinkLock';
import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import { BrowserRouter, Link } from 'react-router-dom';

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

// The mode is the first path segment (e.g. /mfa/contacts), kept during
// navigation by using it as the router basename
const getMode = (): DemoMode | null => {
    const mode = window.location.pathname.split('/')[1];
    if (mode === 'standard' || mode === 'mfa') return mode;
    return null;
};

const setMode = (mode: DemoMode) => {
    window.location.href = `/${mode}/login`;
};

const MFALoginPage = () => (
    <LoginPage>
        <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
            <Typography variant="body2">
                This demo enforces Multi-Factor Authentication (TOTP). After
                login, you will be asked to enroll or verify your authenticator
                app. Once logged in, add or remove authenticators from the user
                menu.
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

// Forward the ref and props so that Material UI can manage the keyboard navigation
const UserMenuItemLink = forwardRef<
    HTMLAnchorElement,
    { to: string; icon: ReactNode; label: string }
>(({ to, icon, label, ...props }, ref) => {
    const onClose = useUserMenu()?.onClose;
    return (
        <MenuItem
            component={Link}
            to={to}
            onClick={onClose}
            ref={ref}
            {...props}
        >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
        </MenuItem>
    );
});

const MFAAppBar = () => (
    <AppBar
        userMenu={
            <UserMenu>
                <UserMenuItemLink
                    to="/mfa-enroll"
                    icon={<PhonelinkLockIcon fontSize="small" />}
                    label="Add an authenticator"
                />
                <UserMenuItemLink
                    to="/mfa-unenroll"
                    icon={<PhonelinkEraseIcon fontSize="small" />}
                    label="Remove an authenticator"
                />
                <Logout />
            </UserMenu>
        }
    />
);

const MFALayout = ({ children }: LayoutProps) => (
    <Layout appBar={MFAAppBar}>{children}</Layout>
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
            <BrowserRouter basename="/standard">
                <AdminGuesser
                    instanceUrl={instanceUrl}
                    apiKey={apiKey}
                    dataProvider={dataProvider}
                    authProvider={standardAuthProvider}
                />
            </BrowserRouter>
        );
    }

    if (mode === 'mfa') {
        return (
            <BrowserRouter basename="/mfa">
                <AdminGuesser
                    instanceUrl={instanceUrl}
                    apiKey={apiKey}
                    dataProvider={dataProvider}
                    authProvider={mfaAuthProvider}
                    loginPage={<MFALoginPage />}
                    layout={MFALayout}
                />
            </BrowserRouter>
        );
    }

    return <HomePage />;
};

export default App;
