import { BrowserRouter } from 'react-router-dom';
import { AdminGuesser } from 'ra-supabase';

const App = () => (
    <BrowserRouter>
        <AdminGuesser
            instanceUrl={import.meta.env.VITE_SUPABASE_URL}
            apiKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
        />
    </BrowserRouter>
);

export default App;
