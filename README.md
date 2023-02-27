# ra-supabase

This package provides a dataProvider, an authProvider, hooks and components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

It leverages [ra-supabase-core](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-core) and [ra-supabase-ui-materialui](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-ui-materialui).

## Installation

```sh
yarn add ra-supabase
# or
npm install ra-supabase
```

## Usage

```jsx
// in supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase';
import { supabaseClient } from './supabase';

export const dataProvider = supabaseDataProvider({
    instanceUrl: 'YOUR_SUPABASE_URL',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    supabaseClient
});

// in authProvider.js
import { supabaseAuthProvider } from 'ra-supabase';
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
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={LoginPage}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

## Internationalization Support

We provide two language packages:

-   [ra-supabase-language-english](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-english)
-   [ra-supabase-language-french](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-french)

```js
// in i18nProvider.js
import { mergeTranslations } from 'ra-core';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import frenchMessages from 'ra-language-french';
import { raSupabaseEnglishMessages } from 'ra-supabase-language-english';
import { raSupabaseFrenchMessages } from 'ra-supabase-language-french';

const allEnglishMessages = mergeTranslations(
    englishMessages,
    raSupabaseEnglishMessages
);
const allFrenchMessages = mergeTranslations(
    frenchMessages,
    raSupabaseFrenchMessages
);

export const i18nProvider = polyglotI18nProvider(
    locale => (locale === 'fr' ? allFrenchMessages : allEnglishMessages),
    'en'
);

// in App.js
import { Admin, Resource, ListGuesser } from 'react-admin';
import { authRoutes } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        customRoutes={authRoutes}
    >
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

export const PostList = () => (
    <List filters={postFilters}>
        ...
    </List>
);
```

See the [PostgREST documentation](https://postgrest.org/en/stable/api.html#operators) for a list of supported operators.

#### RLS

As users authenticate through supabase, you can leverage [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security). Users identity will be propagated through the dataProvider if you provided the public API (anon) key. Keep in mind that passing the `service_role` key will bypass Row Level Security. This is not recommended. 

### Authentication

`ra-supabase` supports email/password and OAuth authentication.

#### Email & Password Authentication

To setup only the email/password authentication, just pass the `LoginPage` to the `loginPage` prop of the `<Admin>` component:

```jsx
import { Admin, Resource, ListGuesser } from 'react-admin';
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={LoginPage}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

#### OAuth Authentication

To setup OAuth authentication, you can pass a `LoginPage` element:

```jsx
import { Admin, Resource, ListGuesser } from 'react-admin';
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={<LoginPage providers={['github', 'twitter']} />}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

Make sure you enabled the specified providers in your Supabase instance:
- [Hosted instance](https://supabase.com/docs/guides/auth/social-login)
- [Local instance](https://supabase.com/docs/reference/cli/config#auth.external.provider.enabled)

To disable email/password authentication, set the `disableEmailPassword` prop:

```jsx
import { Admin, Resource, ListGuesser } from 'react-admin';
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={<LoginPage disableEmailPassword providers={['github', 'twitter']} />}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

## Roadmap

-   Add support for magic link authentication
-   Add support for invitation handling
-   Add support for password reset
-   Add support for uploading files to Supabase storage

## Local Development

This project uses a [local instance of Supabase](https://supabase.com/docs/guides/cli/local-development). To set up your environment, run the following command:

```sh
make install supabase-start db-setup
```

This will:
- install dependencies
- initialize an `.env` file with environment variables to target the supabase instance
- start the supabase instance
- apply the database migration
- seed the database with data

You can then start the application in `development` mode with:

```sh
make run
```

To test OAuth providers, you must configure the Supabase local instance. This is done by editing the `./supabase/config.toml` file as described in the [Supabase CLi documentation](https://supabase.com/docs/reference/cli/config#auth.external.provider.enabled).

For instance, to add support for Github authentication, you have to:

1. Create a GitHub Oauth App

Go to the GitHub Developer Settings page:
- Click on your profile picture at the top right
- Click Settings near the bottom of the menu
- In the left sidebar, click Developer settings (near the bottom)
- In the left sidebar, click OAuth Apps
- Click Register a new application. If you've created an app before, click New OAuth App here.
- In Application name, type the name of your app.
- In Homepage URL, type the full URL to your app's website: `http://localhost:8000`
- In Authorization callback URL, type the callback URL of your app: `http://localhost:54321/auth/v1/callback`
- Click Save Changes at the bottom right.
- Click Register Application
- Copy and save your Client ID.
- Click Generate a new client secret.
- Copy and save your Client secret

2. Update the `./supabase/config` file

```toml
[auth.external.github]
enabled = true
client_id = "YOUR_GITHUB_CLIENT_ID"
secret = "YOUR_GITHUB_CLIENT_SECRET"
```

3. Restart the supabase instance

```sh
make supabase-stop supabase-start db-setup
```

4. Update the demo login page configuration:

Open the `./packages/demo/src/App.tsx` file and update it.

```diff
<Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    layout={Layout}
    dashboard={Dashboard}
-    loginPage={LoginPage}
+    loginPage={<LoginPage providers={['github']} />}
    queryClient={queryClient}
    theme={{
        ...defaultTheme,
        palette: {
            background: {
                default: '#fafafb',
            },
        },
    }}
>
```