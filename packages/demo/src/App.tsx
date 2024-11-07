import { AdminGuesser } from 'ra-supabase';

const App = () => (
    <AdminGuesser
        instanceUrl={import.meta.env.VITE_SUPABASE_URL}
        apiKey={import.meta.env.VITE_SUPABASE_ANON_KEY}
    />
);

export default App;
