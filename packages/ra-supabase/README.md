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

export const supabaseClient = createClient(
    'YOUR_SUPABASE_URL',
    'YOUR_SUPABASE_ANON_KEY'
);

// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase';
import { supabaseClient } from './supabase';

export const dataProvider = supabaseDataProvider({
    instanceUrl: 'YOUR_SUPABASE_URL',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    supabaseClient,
});

// in authProvider.js
import { supabaseAuthProvider } from 'ra-supabase';
import { supabaseClient } from './supabase';

export const authProvider = supabaseAuthProvider(supabaseClient, {
    getIdentity: async user => {
        const { data, error } = await supabaseClient
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
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, SetPasswordPage, ForgotPasswordPage } from 'ra-supabase';
import { BrowserRouter, Route } from 'react-router-dom';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={LoginPage}
        >
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
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

You must wrap your `<Admin>` inside a `<BrowserRouter>` as supabase use hash parameters for passing authentication tokens.

### Using Hash Router

Supabase uses URL hash links for its redirections. This can cause conflicts if you use a HashRouter. For this reason, we recommend using the BrowserRouter.

If you want to use the HashRouter, you'll need to modify the code.

1. Create a custom `auth-callback` folder inside your public folder.
2. Create an `index.html` file inside the `auth-callback`. This file will intercept the supabase redirect and rewrite the URL to prevent conflicts with the HashRouter. For example, see `packages/demo/public/auth-callback.html`.
3. Remove `BrowserRouter` from your `App.ts`
4. Go to your dashboard **Authentication** section
5. In **URL Configuration**, add the following URL in the **Redirect URLs** section: `YOUR_APPLICATION_URL/auth-callback.html`
6. In **Email Templates**, change the `"{{ .ConfirmationURL }}"` to `"{{ .ConfirmationURL }}/auth-callback.html"`

## Features

### DataProvider

`ra-supabase` is built on [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest/tree/v2.0.0) that leverages [PostgREST](https://postgrest.org/en/stable/). As such, you have access the following features:

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

#### Customizing the dataProvider

`supabaseDataProvider` also accepts the same options as the `ra-data-postgrest` dataProvider (except `apiUrl`), like [`primaryKeys`](https://github.com/raphiniert-com/ra-data-postgrest/blob/master/README.md#compound-primary-keys) or [`schema`](https://github.com/raphiniert-com/ra-data-postgrest/blob/master/README.md#custom-schema).

```jsx
// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase-core';
import { supabaseClient } from './supabase';

export const dataProvider = supabaseDataProvider({
    instanceUrl: 'YOUR_SUPABASE_URL',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    supabaseClient,
    primaryKeys: new Map([
        ['some_table', ['custom_id']],
        ['another_table', ['first_column', 'second_column']],
    ]),
    schema: () => localStorage.getItem('schema') || 'api',
});
```

See the [`ra-data-postgrest`` documentation](https://github.com/raphiniert-com/ra-data-postgrest/blob/master/README.md) for more details.

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
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={LoginPage}
        >
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

### Invitation Handling

`ra-supabase` supports the invitation workflow. If a user is invited to use the application (by sending an invitation through Supabase dashboard for instance), you can configure the `/set-password` custom route to allow them to set their password.

This requires you to configure your supabase instance:

##### Via config.toml

1. Go to your `config.toml` file
2. In `[auth]` section set `site_url` to your application URL
3. In `[auth]`, add the following URL in the `additional_redirect_urls = [{APPLICATION_URL}}/auth-callback"]`
4. Add an `[auth.email.template.invite]` section with the following option

```
[auth.email.template.invite]
subject = "You have been invited"
content_path = "./supabase/templates/invite.html"
```

In `invite.html` set the `auth-callback` redirection

```HTML
<html>
  <body>
   <h2>You have been invited</h2>
    <p>You have been invited to create a user on {{ .SiteURL }}. Follow this link to accept the invite:</p>
    <p><a href="{{ .ConfirmationURL }}/auth-callback">Accept the invite</a></p>

</html>
```

##### Via Dashboard

1. Go to your dashboard **Authentication** section
1. In **URL Configuration**, set **Site URL** to your application URL
1. In **URL Configuration**, add the following URL in the **Redirect URLs** section: `YOUR_APPLICATION_URL/auth-callback`
1. In **Email Templates**, change the `"{{ .ConfirmationURL }}"` to `"{{ .ConfirmationURL }}/auth-callback"`

You can now add the `/set-password` custom route:

```jsx
// in App.js
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, SetPasswordPage } from 'ra-supabase';
import { BrowserRouter, Route } from 'react-router-dom';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={LoginPage}
        >
            <CustomRoutes noLayout>
                <Route
                    path={SetPasswordPage.path}
                    element={<SetPasswordPage />}
                />
            </CustomRoutes>
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

For HashRouter see [Using Hash Router](#using-hash-router).

### Password Reset When Forgotten

If users forgot their password, they can request for a reset if you add the `/forgot-password` custom route. You should also set up the [`/set-password` custom route](#invitation-handling) to allow them to choose their new password.

This requires you to configure your supabase instance:

##### Via config.toml

1. Go to your `config.toml` file
2. In `[auth]` section set `site_url` to your application URL
3. In `[auth]`, add the following URL in the `additional_redirect_urls = [{APPLICATION_URL}}/auth-callback"]`
4. Add an `[auth.email.template.recovery]` section with the following option

```
[auth.email.template.recovery]
subject = "Reset Password"
content_path = "./supabase/templates/recovery.html"
```

In `recovery.html` set the `auth-callback` redirection

```HTML
<html>
  <body>
    <h2>Reset Password</h2>
    <p><a href="{{ .ConfirmationURL }}/auth-callback">Reset your password</a></p>
  </body>
</html>
```

##### Via Dashboard

1. Go to your dashboard **Authentication** section
1. In **URL Configuration**, set **Site URL** to your application URL
1. In **URL Configuration**, add the following URL in the **Redirect URLs** section: `YOUR_APPLICATION_URL/auth-callback`
1. In **Email Templates**, change the `"{{ .ConfirmationURL }}"` to `"{{ .ConfirmationURL }}/auth-callback"`

You can now add the `/forgot-password` and `/set-password` custom routes:

```jsx
// in App.js
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, SetPasswordPage, ForgotPasswordPage } from 'ra-supabase';
import { BrowserRouter, Route } from 'react-router-dom';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={LoginPage}
        >
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
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

For HashRouter see [Using Hash Router](#using-hash-router).

#### OAuth Authentication

To setup OAuth authentication, you can pass a `LoginPage` element:

```jsx
import { Admin, Resource, ListGuesser } from 'react-admin';
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            loginPage={<LoginPage providers={['github', 'twitter']} />}
        >
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

Make sure you enabled the specified providers in your Supabase instance:

-   [Hosted instance](https://supabase.com/docs/guides/auth/social-login)
-   [Local instance](https://supabase.com/docs/reference/cli/config#auth.external.provider.enabled)

This also requires you to configure the redirect URLS on your supabase instance:

##### Via config.toml
1. Go to your `config.toml` file
2. In `[auth]` section set `site_url` to your application URL
3. In `[auth]`, add the following URL in the `additional_redirect_urls = [{APPLICATION_URL}}/auth-callback"]`

##### Via Dashboard
1. Go to your dashboard **Authentication** section
1. In **URL Configuration**, set **Site URL** to your application URL
1. In **URL Configuration**, add the following URL in the **Redirect URLs** section: `YOUR_APPLICATION_URL/auth-callback`

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
        loginPage={
            <LoginPage disableEmailPassword providers={['github', 'twitter']} />
        }
    >
        <Resource name="posts" list={ListGuesser} />
        <Resource name="authors" list={ListGuesser} />
    </Admin>
);
```

For HashRouter see [Using Hash Router](#using-hash-router).

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
import { LoginPage } from 'ra-supabase';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { i18nProvider } from './i18nProvider';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            loginPage={LoginPage}
        >
            <Resource name="posts" list={ListGuesser} />
            <Resource name="authors" list={ListGuesser} />
        </Admin>
    </BrowserRouter>
);
```

## Roadmap

-   Add support for magic link authentication
-   Add support for uploading files to Supabase storage
