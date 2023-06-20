# ra-supabase-core

This package provide a dataProvider, an authProvider and hooks to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin).

## Installation

```sh
yarn add ra-supabase-core
# or
npm install ra-supabase-core
```

## Usage

```jsx
// in supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase-core';
import { supabaseClient } from './supabase';

export const dataProvider = supabaseDataProvider({
    instanceUrl: 'YOUR_SUPABASE_URL',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    supabaseClient,
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

## Features

### DataProvider

`ra-supabase` is built on [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest/tree/v2.0.0-alpha.0) that leverages [PostgREST](https://postgrest.org/en/stable/). As such, you have access the following features:

#### Filters operators

When specifying the `source` prop of filter inputs, you can either set it to the field name for simple equality checks or add an operator suffix for more control. For instance, the `gte` (Greater Than or Equal) or the `ilike` (Case insensitive like) operators:

```jsx
const postFilters = [
    <TextInput label="Title" source="title@ilike" alwaysOn />,
    <TextInput label="Views" source="views@gte" />,
];

export const PostList = () => <List filters={postFilters}>...</List>;
```

See the [PostgREST documentation](https://postgrest.org/en/stable/api.html#operators) for a list of supported operators.

#### RLS

As users authenticate through supabase, you can leverage [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security). Users identity will be propagated through the dataProvider if you provided the public API (anon) key. Keep in mind that passing the `service_role` key will bypass Row Level Security. This is not recommended.

### Authentication

`ra-supabase` supports email/password and OAuth authentication.

#### Email & Password Authentication

To login users using their email and password, call the `login` method returned by the `useLogin` hook with the user credentials as an object:

```jsx
import { useLogin } from 'react-admin';

const myLoginForm = () => {
    const login = useLogin();
    const redirectTo = window.location.toString();

    const handleSubmit = event => {
        login(
            {
                email: event.target.email.value,
                password: event.target.password.value,
            },
            redirectTo
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" />
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" />
            <button type="submit">Login</button>
        </form>
    );
};
```

#### OAuth Authentication

To login users using the OAuth providers enabled on your Supabase instance, call the `login` method returned by the `useLogin` hook with an object containing the provider name:

```jsx
import { useLogin } from 'react-admin';

const myLoginForm = () => {
    const login = useLogin();

    const loginWith = (provider) => {
        const redirectTo = window.location.toString();

        const options = {
            redirectTo: redirectTo
        }

        login({ provider, options }).catch(
            error => {
                // The authProvide always reject for OAuth login but there will be no error
                // if the call actually succeeds. This is to avoid react-admin redirecting
                // immediately to the provided redirect prop before users are redirected to
                // the OAuth provider.
                if (error) {
                    notify((error as Error).message, { type: 'error' });
                }
            }
        );
    }

    return (
        <div>
            <button onClick={() => loginWith('github')}>Login with Github</button>
            <button onClick={() => loginWith('twitter')}>Login with Twitter</button>
        </div>
    )
}
```

Make sure you enabled the specified providers in your Supabase instance:

-   [Hosted instance](https://supabase.com/docs/guides/auth/social-login)
-   [Local instance](https://supabase.com/docs/reference/cli/config#auth.external.provider.enabled)

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

`supabaseAuthProvider` also provides an additional `setPassword` method. This method allows you to create UI for users to set their passwords after being invited for example. This could be done in a custom route. The method signature is the following:

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
