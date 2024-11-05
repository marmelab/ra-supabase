import * as React from 'react';

import { AdminContext, AdminUI, Resource, Loading } from 'react-admin';
import type { AdminProps, AdminUIProps } from 'react-admin';

import { useCrudGuesser } from './useCrudGuesser';

export const AdminGuesser = (props: AdminProps) => {
    const {
        authProvider,
        basename,
        darkTheme,
        dataProvider,
        defaultTheme,
        i18nProvider,
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
    const { children, ...rest } = props;
    if (!children) {
        console.log(
            `Guessed Admin:
import { Admin, Resource } from 'react-admin';
import ( ListGuesser, EditGuesser, CreateGuesser, ShowGuesser ) from 'ra-supabase';   

export const App = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>${resourceDefinitions
        .map(
            def => `
        <Resource name="${def.name}"${def.list ? ' list={ListGuesser}' : ''}${
                def.edit ? ' edit={EditGuesser}' : ''
            }${def.create ? ' create={CreateGuesser}' : ''}${
                def.show ? ' show={ShowGuesser}' : ''
            } />`
        )
        .join('')}
    </Admin>
);`
        );
    }
    return (
        <AdminUI ready={Loading} {...rest}>
            {children ??
                resourceDefinitions.map(resourceDefinition => (
                    <Resource
                        key={resourceDefinition.name}
                        {...resourceDefinition}
                    />
                ))}
        </AdminUI>
    );
};
