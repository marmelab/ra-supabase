import * as React from 'react';
import { Admin, Resource, ListGuesser, defaultTheme } from 'react-admin';
import {
    unstable_createMuiStrictModeTheme,
    createTheme,
} from '@material-ui/core/styles';
import { createBrowserHistory } from 'history';
import { authRoutes, LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import Layout from './Layout';
import contacts from './contacts';
import companies from './companies';
import deals from './deals';
import { Dashboard } from './dashboard/Dashboard';

// FIXME MUI bug https://github.com/mui-org/material-ui/issues/13394
const theme =
    process.env.NODE_ENV !== 'production'
        ? unstable_createMuiStrictModeTheme(defaultTheme)
        : createTheme(defaultTheme);

const history = createBrowserHistory();
const App = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        layout={Layout}
        dashboard={Dashboard}
        theme={theme}
        loginPage={LoginPage}
        customRoutes={authRoutes}
        history={history}
    >
        <Resource name="deals" {...deals} />
        <Resource name="contacts" {...contacts} />
        <Resource name="companies" {...companies} />
        <Resource name="contactNotes" />
        <Resource name="dealNotes" />
        <Resource name="tasks" list={ListGuesser} />
        <Resource name="sales" list={ListGuesser} />
        <Resource name="tags" list={ListGuesser} />
    </Admin>
);

export default App;
