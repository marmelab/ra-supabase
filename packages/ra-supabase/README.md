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

## Roadmap

-   Add support for magic link authentication
-   Add support for invitation handling
-   Add support for password reset
-   Add support for uploading files to Supabase storage
