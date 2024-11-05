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

import {
    useCrudGuesser,
    LoginPage,
    SetPasswordPage,
    ForgotPasswordPage,
} from 'ra-supabase-ui-materialui';
import { defaultI18nProvider } from './defaultI18nProvider';

export const AdminGuesser = (props: AdminProps) => {
    const {
        authProvider,
        basename,
        darkTheme,
        dataProvider,
        defaultTheme,
        i18nProvider = defaultI18nProvider,
        lightTheme,
        queryClient,
        store,
        theme,
        ...rest
    } = props;

    return (
        <AdminContext
            authProvider={authProvider}
            basename={basename}
            darkTheme={darkTheme}
            dataProvider={dataProvider}
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
import {
    CreateGuesser,
    EditGuesser,
    ForgotPasswordPage,
    ListGuesser,
    LoginPage,
    SetPasswordPage,
    ShowGuesser,
    defaultI18nProvider,
} from 'ra-supabase';   

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
