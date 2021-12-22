# ra-supabase

This package provides a dataProvider, an authProvider, hooks and components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

It leverages [ra-supabase-core](https://github.com/marmelab/ra-supabase-core) and [ra-supabase-ui-materialui](https://github.com/marmelab/ra-supabase-ui-materialui).

In particular, this package provides components around Supabase authentication with the following workflow:

1. You invite users from the Supabase Admin page.
2. Users can use the invite link they received by email.
3. They arrive on a page where they can set their password.
4. They can now login using their email and password.

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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabase';

const resources = {
    posts: ['id', 'title', 'body', 'author_id', 'date'],
    authors: ['id', 'full_name'],
};

export const dataProvider = supabaseDataProvider(supabase, resources);

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
import { authRoutes, LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        customRoutes={authRoutes}
        loginPage={LoginPage}
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

## Internationalization Support

We provide two language packages:

-   [ra-supabase-language-english](https://github.com/marmelab/ra-supabase-language-english)
-   [ra-supabase-language-french](https://github.com/marmelab/ra-supabase-language-french)

`ra-supabase` already re-export `ra-supabase-language-english` but you must set up the i18nProvider yourself:

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

## Full Text Search Support

When using react-admin [SearchInput](https://marmelab.com/react-admin/List.html#full-text-search), you might not want the filter to apply on all the resource fields but only some of them. You can configure this in the `dataProvider`.

Instead of passing an array of fields for each resource, you can pass an object with two properties:

-   `fields`: An array of fields to return for all requests
-   `fullTextSearchFields`: An array of fields on which to apply full text filters

```js
// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase';
import { supabase } from './supabase';

const resources = {
    posts: {
        fields: ['id', 'title', 'body', 'author_id', 'date'],
        fullTextSearchFields: ['title', 'body'],
    },
    authors: {
        fields: ['id', 'full_name'],
        fullTextSearchFields: ['full_name'],
    },
};

export const dataProvider = supabaseDataProvider(supabase, resources);
```

## Roadmap

-   Add support for magic link authentication
-   Add support for third party authentication
-   Add support for uploading files to Supabase storage
