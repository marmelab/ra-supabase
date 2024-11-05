import * as React from 'react';
import {
    AdminContext,
    AdminUI,
    Resource,
    Loading,
    CustomRoutes,
} from 'react-admin';
import type { AdminProps, AdminUIProps } from 'react-admin';
import { Route } from 'react-router-dom';

import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase-core';
import {
    useCrudGuesser,
    LoginPage,
    SetPasswordPage,
    ForgotPasswordPage,
} from 'ra-supabase-ui-materialui';
import { createClient } from '@supabase/supabase-js';
import { defaultI18nProvider } from './defaultI18nProvider';

export const AdminGuesser = (
    props: AdminProps & { apiUrl?: string; apiKey?: string }
) => {
    const {
        apiUrl,
        apiKey,
        dataProvider,
        authProvider,
        basename,
        darkTheme,
        defaultTheme,
        i18nProvider = defaultI18nProvider,
        lightTheme,
        queryClient,
        store,
        theme,
        ...rest
    } = props;

    const defaultSupabaseClient =
        apiUrl && apiKey ? createClient(apiUrl, apiKey) : null;
    const defaultDataProvider =
        apiUrl && apiKey && defaultSupabaseClient
            ? supabaseDataProvider({
                  instanceUrl: apiUrl,
                  apiKey,
                  supabaseClient: defaultSupabaseClient,
              })
            : undefined;
    const defaultAuthProvider =
        apiUrl && apiKey && defaultSupabaseClient
            ? supabaseAuthProvider(defaultSupabaseClient, {})
            : undefined;

    return (
        <AdminContext
            authProvider={authProvider ?? defaultAuthProvider}
            basename={basename}
            darkTheme={darkTheme}
            dataProvider={dataProvider ?? defaultDataProvider}
            defaultTheme={defaultTheme}
            i18nProvider={i18nProvider}
            lightTheme={lightTheme}
            queryClient={queryClient}
            store={store}
            theme={theme}
        >
            <AdminUIGuesser {...rest} />
        </AdminContext>
    );
};

const AdminUIGuesser = (props: AdminUIProps) => {
    const resourceDefinitions = useCrudGuesser();
    const hasLogged = React.useRef(false);
    const { children, ...rest } = props;
    if (!children && resourceDefinitions.length > 0 && !hasLogged.current) {
        console.log(
            `Guessed Admin:

import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
    CreateGuesser,
    EditGuesser,
    ForgotPasswordPage,
    ListGuesser,
    LoginPage,
    SetPasswordPage,
    ShowGuesser,
    defaultI18nProvider,
    supabaseDataProvider,
    supabaseAuthProvider
} from 'ra-supabase';   

const instanceUrl = YOUR_SUPABASE_URL;
const apiKey = YOUR_SUPABASE_API_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);
const dataProvider = supabaseDataProvider({ instanceUrl, apiKey, supabaseClient });
const authProvider = supabaseAuthProvider(supabaseClient, {});

export const App = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={defaultI18nProvider}
        loginPage={LoginPage}
    >${resourceDefinitions
        .map(
            def => `
        <Resource name="${def.name}"${def.list ? ' list={ListGuesser}' : ''}${
                def.edit ? ' edit={EditGuesser}' : ''
            }${def.create ? ' create={CreateGuesser}' : ''}${
                def.show ? ' show={ShowGuesser}' : ''
            } />`
        )
        .join('')}
        <CustomRoutes noLayout>
            <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
            <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
        </CustomRoutes>
    </Admin>
);`
        );
        hasLogged.current = true;
    }

    const resourceElements = resourceDefinitions.map(resourceDefinition => (
        <Resource key={resourceDefinition.name} {...resourceDefinition} />
    )) as any;
    return (
        <AdminUI ready={Loading} loginPage={LoginPage} {...rest}>
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
            {children ?? resourceElements}
        </AdminUI>
    );
};
