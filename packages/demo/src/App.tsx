import * as React from 'react';
import { mergeTranslations } from 'react-admin';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import { BrowserRouter } from 'react-router-dom';
import {
    AdminGuesser,
    LoginPage,
    raSupabaseEnglishMessages,
} from 'ra-supabase';
import { authProvider } from './authProvider';
import { Dashboard } from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';

const i18nProvider = polyglotI18nProvider(() => {
    return mergeTranslations(englishMessages, raSupabaseEnglishMessages);
}, 'en');

const App = () => (
    <BrowserRouter>
        <AdminGuesser
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            dashboard={Dashboard}
            loginPage={LoginPage}
            title="CRM Demo"
        />
    </BrowserRouter>
);

export default App;
