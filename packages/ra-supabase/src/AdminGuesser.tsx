import * as React from 'react';
import {
    AdminContext,
    AdminUI,
    Resource,
    Loading,
    CustomRoutes,
} from 'react-admin';
import type { AdminProps, AdminUIProps } from 'react-admin';
import { Route, BrowserRouter } from 'react-router-dom';

import { supabaseDataProvider, supabaseAuthProvider } from 'ra-supabase-core';
import {
    useCrudGuesser,
    LoginPage,
    SetPasswordPage,
    ForgotPasswordPage,
    MFAEnrollPage,
    MFAChallengePage,
    MFAUnenrollPage,
} from 'ra-supabase-ui-materialui';
import { createClient } from '@supabase/supabase-js';
import { defaultI18nProvider } from './defaultI18nProvider';

export const AdminGuesser = (
    props: AdminProps & { instanceUrl: string; apiKey: string }
) => {
    const {
        instanceUrl,
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
        instanceUrl && apiKey ? createClient(instanceUrl, apiKey) : null;
    const defaultDataProvider =
        instanceUrl && apiKey && defaultSupabaseClient
            ? supabaseDataProvider({
                  instanceUrl,
                  apiKey,
                  supabaseClient: defaultSupabaseClient,
              })
            : undefined;
    const defaultAuthProvider =
        instanceUrl && apiKey && defaultSupabaseClient
            ? supabaseAuthProvider(defaultSupabaseClient, {})
            : undefined;

    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
};

const AdminUIGuesser = (props: AdminUIProps) => {
    const resourceDefinitions = useCrudGuesser();
    const { children, ...rest } = props;
    // while we're guessing, we don't want to show the not found page
    const [CatchAll, setCatchAll] = React.useState<
        React.ComponentType | undefined
    >(() => Loading);
    React.useEffect(() => {
        if (!children && resourceDefinitions.length > 0) {
            console.log(
                `Guessed Admin:

import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
    CreateGuesser,
    EditGuesser,
    ForgotPasswordPage,
    ListGuesser,
    LoginPage,
    MFAEnrollPage,
    MFAChallengePage,
    MFAUnenrollPage,
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
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={defaultI18nProvider}
            loginPage={LoginPage}
        >${resourceDefinitions
            .map(
                def => `
            <Resource name="${def.name}"${
                    def.list ? ' list={ListGuesser}' : ''
                }${def.edit ? ' edit={EditGuesser}' : ''}${
                    def.create ? ' create={CreateGuesser}' : ''
                }${def.show ? ' show={ShowGuesser}' : ''} />`
            )
            .join('')}
            <CustomRoutes noLayout>
                <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
                <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
                <Route path={MFAEnrollPage.path} element={<MFAEnrollPage />} />
                <Route path={MFAChallengePage.path} element={<MFAChallengePage />} />
                <Route path={MFAUnenrollPage.path} element={<MFAUnenrollPage />} />
            </CustomRoutes>
        </Admin>
    </BrowserRouter>
);`
            );
        }
    }, [resourceDefinitions, children]);

    React.useEffect(() => {
        // once we have guessed all the resources, we can show the not found page for unknown paths
        if (!children && resourceDefinitions.length > 0) {
            setCatchAll(undefined);
        }
    }, [resourceDefinitions, children]);

    const resourceElements = resourceDefinitions.map(resourceDefinition => (
        <Resource key={resourceDefinition.name} {...resourceDefinition} />
    )) as any;

    return (
        <AdminUI
            ready={Loading}
            catchAll={CatchAll}
            loginPage={LoginPage}
            {...rest}
        >
            {children ?? resourceElements}
            <CustomRoutes noLayout>
                <Route
                    path={SetPasswordPage.path}
                    element={<SetPasswordPage />}
                />
                <Route
                    path={ForgotPasswordPage.path}
                    element={<ForgotPasswordPage />}
                />
                <Route path={MFAEnrollPage.path} element={<MFAEnrollPage />} />
                <Route
                    path={MFAChallengePage.path}
                    element={<MFAChallengePage />}
                />
                <Route
                    path={MFAUnenrollPage.path}
                    element={<MFAUnenrollPage />}
                />
            </CustomRoutes>
        </AdminUI>
    );
};
