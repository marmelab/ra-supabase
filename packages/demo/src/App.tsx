import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
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
    supabaseAuthProvider,
} from 'ra-supabase';
import { ContactList } from './ContactList';

const instanceUrl = import.meta.env.VITE_SUPABASE_URL;
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);
const dataProvider = supabaseDataProvider({
    instanceUrl,
    apiKey,
    supabaseClient,
});
const authProvider = supabaseAuthProvider(supabaseClient, {});

const App = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={defaultI18nProvider}
            loginPage={LoginPage}
        >
            <Resource
                name="contacts"
                list={ContactList}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="tasks"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="companies"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="dealNotes"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="sales"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="deals"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="tags"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
            <Resource
                name="contactNotes"
                list={ListGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
                show={ShowGuesser}
            />
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
        </Admin>
    </BrowserRouter>
);

export default App;
