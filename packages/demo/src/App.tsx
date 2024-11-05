import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AdminGuesser } from 'ra-supabase';
import { authProvider } from './authProvider';
import { Dashboard } from './dashboard/Dashboard';
import { dataProvider } from './dataProvider';

const App = () => (
    <BrowserRouter>
        <AdminGuesser
            dataProvider={dataProvider}
            authProvider={authProvider}
            dashboard={Dashboard}
            title="CRM Demo"
        />
    </BrowserRouter>
);

export default App;
