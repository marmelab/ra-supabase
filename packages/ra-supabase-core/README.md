# ra-supabase-core

This package provide a dataProvider, an authProvider and hooks to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin).

## Usage

```jsx
// in supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase-core';
import { supabaseClient } from './supabase';

export const dataProvider = supabaseDataProvider({
    instanceUrl: 'YOUR_SUPABASE_URL',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    supabaseClient
});

// in authProvider.js
import { supabaseAuthProvider } from 'ra-supabase-core';
import { supabase } from './supabase';

export const authProvider = supabaseAuthProvider(supabase, {
    getIdentity: async user => {
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
            fullName: `${data.first_name} ${data.last_name}`,
        };
    },
});

// in App.js
import { Admin, Resource, ListGuesser } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

## Authentication

We currently only support email/password authentication. The `supabaseAuthProvider` provides the `setPassword` method in addition of the `authProvider` methods required by `react-admin`. This method allows you to create UI for users to set their passwords after being invited for example. This could be done in a custom route.

To make this custom route easier to implement, this package also provide the following hooks:

-   [useRedirectIfAuthenticated](#useredirectifauthenticated): to be used inside a [custom Login page](https://marmelab.com/react-admin/Authentication.html#customizing-the-login-and-logout-components). Redirects users to the home page if they are signed in.
-   [useSupabaseAccessToken](#usesupabaseaccesstoken): to be used inside a custom route to which invited users are redirected. This route should allow them to set their password and this hook will take care of retrieving the supabase access token from the URL for you to use with `useSetPassword`.
-   [useSetPassword](#usesetpassword): to be used inside a custom route to which invited users are redirected. This route should allow them to set their password and this hook returns a function to do so. It needs the supabase access token.

## API

### The `supabaseDataProvider`

The `supabaseDataProvider` leverages [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest). Please refer to their documentation to know how to use it.

### The `supabaseAuthProvider`

The `supabaseAuthProvider` must be initialized with your supabase client and an optional function to call when we need to display the [user identity](https://marmelab.com/react-admin/Authentication.html#user-identity). Here's an example that fetches the user identity from a `userProfiles` table:

```jsx
// in authProvider.js
import { supabaseAuthProvider } from 'ra-supabase-core';
import { supabase } from './supabase';

export const authProvider = supabaseAuthProvider(supabase, {
    getIdentity: async user => {
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
            fullName: `${data.first_name} ${data.last_name}`,
        };
    },
});
```

`supabaseAuthProvider` also provides an additional `setPassword` method. This method allows you to create UI for users to set their passwords after being invited for example. This could be done in a custom route. See the [Authentication](#authentication) section for more details. The method signature is the following:

`setPassword({ access_token: string; password: string }): Promise<void>`

### The `useSupabaseAccessToken` hook

This hook returns the access token for the current user from the URL and redirects the user to the home page if no access token is found. The redirection url can be overridden or disabled. The name of the
access token parameter to look for in the URL can also be overridden (`access_token` by default).

This is useful in pages related to authentication such as one which would allow invited users to set their password.

```jsx
import { useSupabaseAccessToken } from 'ra-supabase-core';

const SetPasswordPage = () => {
    const access_token = useSupabaseAccessToken();

    // Logic and UI to set the user password
};
```

### The `useSetPassword` hook

This hook returns a function you can call to set the current user password. The function requires the user access token. The hook accept an option object with the following optional properties:

-   `onSuccess`: A function called when the set password operation succeeds. By default, it redirects users to the home page.
-   `onFailure`: A function called when the set password operation fails. By default, it display an error notification.

```jsx
import { useSupabaseAccessToken } from 'ra-supabase-core';

const SetPasswordPage = () => {
    const access_token = useSupabaseAccessToken();
    const setPassword = useSetPassword();

    const handleSubmit = event => {
        setPassword({
            access_token,
            password: event.currentTarget.elements.password.value,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label for="password">Choose a password:</label>
            <input id="password" name="password" type="password" />
            <button type="submit">Save</button>
        </form>
    );
};
```

### The `useRedirectIfAuthenticated` hook

This hooks checks whether users are authenticated and redirect them to the provided route (which defaults to the home page) when they are.

This is useful inside a custom login page and is the behavior of react-admin default login page, extracted as a hook.

```jsx
import { useRedirectIfAuthenticated } from 'react-admin';
const MyLoginPage = () => {
    useRedirectIfAuthenticated();

    // UI and logic for authentication
};
```

## Roadmap

-   Add support for magic link authentication
-   Add support for third party authentication
