import * as React from 'react';
import {
    Admin,
    Resource,
    ListGuesser,
    defaultTheme,
    mergeTranslations,
    CustomRoutes,
} from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import { BrowserRouter, Route } from 'react-router-dom';
import {
    LoginPage,
    raSupabaseEnglishMessages,
    SetPasswordPage,
    ForgotPasswordPage,
} from 'ra-supabase';
import { QueryClient } from '@tanstack/react-query';
import { authProvider } from './authProvider';
import Layout from './Layout';
import contacts from './contacts';
import companies from './companies';
import deals from './deals';
import { Dashboard } from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';

const queryClient = new QueryClient();
const i18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSupabaseEnglishMessages);
}, 'en');

const App = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
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
                <Route
                    path={SetPasswordPage.path}
                    element={<SetPasswordPage />}
                />
                <Route
                    path={ForgotPasswordPage.path}
                    element={<ForgotPasswordPage />}
                />
            </CustomRoutes>
            <Resource name="deals" {...deals} />
            <Resource name="contacts" {...contacts} />
            <Resource name="companies" {...companies} />
            <Resource name="tasks" list={ListGuesser} />
            <Resource
                name="sales"
                list={ListGuesser}
                recordRepresentation={(record: any) =>
                    `${record.first_name} ${record.last_name}`
                }
            />
            <Resource name="tags" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);

export default App;
