# ra-supabase-ui-materialui

This package provide components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

In particular, this package provide components around Supabase authentication with the following workflow:

1. You invite users from the Supabase Admin page.
2. Users use the invite link they received by email.
3. They arrive on a page where they can set their password.
4. They can now login using their email and password.

## Usage

```jsx
// in supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabase';

const resources = {
    posts: ['id', 'title', 'body', 'author_id', 'date'],
    authors: ['id', 'full_name'],
}

export const dataProvider = supabaseDataProvider(supabase, resources);

// in authProvider.js
import { supabaseAuthProvider } from 'ra-supabase';
import { supabase } from './supabase';

export const authProvider = supabaseAuthProvider(supabase, {
    getIdentity: (user) => {
        const { data, error } = await supabase
            .from('userProfiles')
            .select('id, first_name, last_name')
            .match({ email: user.email })
            .single();

        if (!data || error) {
            throw new Error();
        }

        return {
            id: data.id,
            fullName: `${data.first_name} ${data.last_name}`
        };
    }
});

// in App.js
import { Admin, Resource, ListGuesser } from 'react-admin';
import { authRoutes } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        customRoutes={authRoutes}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
)
```

## API

### `<AuthLayout>`

This component is very similar to the react-admin `<LoginPage>` except it does not check the user authentication status nor does it contain the `<LoginForm>`. It is used by both the `<LoginPage>` and `<SetPasswordPage>` provided by `ra-supabase-ui-materialui`.

### `<LoginPage>`

This is `ra-supabase-ui-materialui` of the `<LoginPage>` that redirects users to the admin home page if they are already logged in and display the `<LoginForm>` otherwise. You may provide your own form by passing it as the `<LoginPage>` child.

### `<LoginForm>`

This is `ra-supabase-ui-materialui` of the `<LoginForm>` that contains an email and password fields. It is exported for you to reuse in a custom login page when needed.

### `<SetPasswordPage>`

This page allows invited users to set their password. It displays the `<SetPasswordForm>` by default but you may provide your own form by passing it as the `<SetPasswordPage>` child.

### `<SetPasswordForm>`

This is the form that actually allows users to set their password. It is exported for you to reuse in a custom set password page when needed. It leverages the `useSetPassword` hook from `ra-supabase-core`.
It accepts an `onSuccess` and `onFailure` props just like the hook:

-   `onSuccess`: A function called when the set password operation succeeds. By default, it redirects users to the home page.
-   `onFailure`: A function called when the set password operation fails. By default, it display an error notification.

## Roadmap

-   Add support for magic link authentication
-   Add support for third parties authentication
