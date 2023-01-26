import * as React from 'react';
import { Admin, Resource, ListGuesser, defaultTheme, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { LoginPage, SetPasswordPage } from 'ra-supabase';
import { QueryClient } from 'react-query';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import Layout from './Layout';
import contacts from './contacts';
import companies from './companies';
import deals from './deals';
import { Dashboard } from './dashboard/Dashboard';

const queryClient = new QueryClient();

const App = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            layout={Layout}
            dashboard={Dashboard}
            loginPage={LoginPage}
            queryClient={queryClient}
            theme={{
                ...defaultTheme,
                palette: {
                    background: {
                        default: '#fafafb',
                    },
                },
            }}
        >
            <CustomRoutes noLayout>
                <Route path="/set-password" element={<SetPasswordPage />} />
            </CustomRoutes>
            <Resource name="deals" {...deals} />
            <Resource name="contacts" {...contacts} />
            <Resource name="companies" {...companies} />
            <Resource name="tasks" list={ListGuesser} />
            <Resource name="sales" list={ListGuesser} />
            <Resource name="tags" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);

export default App;
