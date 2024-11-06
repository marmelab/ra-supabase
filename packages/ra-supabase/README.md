# ra-supabase

This package integrates [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin). It provides a dataProvider, an authProvider, specialized hooks and components to get the most out of Supabase in your react-admin application.

## Installation

```sh
yarn add ra-supabase
# or
npm install ra-supabase
```

`ra-supabase` leverage the authentication mechanisms of Supabase. If you don't need to support [the invitations workflow](#invitation-handling) **and** you only enabled [third party OAuth authentication](#oauth-authentication), you're done with the installation.

If you do want to support [the invitations workflow](#invitation-handling) or use the default email/password authentication, you must do one of the following:

- [Configure Supabase with a custom SMTP provider](https://supabase.com/docs/guides/auth/auth-smtp#how-to-set-up-smtp)
- [Set up an authentication hook to send the emails yourself](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)

## Usage

`ra-supabase` provides an `<AdminGuesser>` component that takes advantage of Supabase's OpenAPI schema to guess the resources and their fields. You can use it as a replacement for react-admin's `<Admin>` component to bootstrap your admin quickly:

```jsx
import { AdminGuesser } from 'ra-supabase';

const App = () => (
    <AdminGuesser
        instanceUrl={YOUR_SUPABASE_URL}
        apiKey={YOUR_SUPABASE_API_KEY}
    />
);

export default App;
```

This generates an admin with CRUD routes for all the resources exposed by Supabase.

To start customizing the app, open the browser console, and copy the guessed admin code. You can then paste it into your own app and start customizing it.

The generated code will look like this:

```jsx
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
    CreateGuesser,
    EditGuesser,
    ForgotPasswordPage,
    ListGuesser,
    LoginPage,
    SetPasswordPage,
    ShowGuesser,
    defaultI18nProvider,
    supabaseDataProvider,
    supabaseAuthProvider
} from 'ra-supabase';   

const instanceUrl = YOUR_SUPABASE_URL;
const apiKey = YOUR_SUPABASE_API_KEY;
const supabaseClient = createClient(instanceUrl, apiKey);
const dataProvider = supabaseDataProvider({ instanceUrl, apiKey, supabaseClient });
const authProvider = supabaseAuthProvider(supabaseClient, {});

export const App = () => (
    <BrowserRouter>
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={defaultI18nProvider}
            loginPage={LoginPage}
        >
            <Resource name="companies" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="contacts" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="deals" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="tags" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="tasks" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="dealNotes" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="contactNotes" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <Resource name="sales" list={ListGuesser} edit={EditGuesser} create={CreateGuesser} show={ShowGuesser} />
            <CustomRoutes noLayout>
                <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
                <Route path={ForgotPasswordPage.path} element={<ForgotPasswordPage />} />
            </CustomRoutes>
        </Admin>
    </BrowserRouter>
);
```

By default, `<AdminGuesser>` uses a `<BrowserRouter>` as supabase use hash parameters for passing authentication tokens. If you want to use a `<HashRouter>`, check out the [Using Hash Router](#using-hash-router) section.

### Filters operators

When specifying the `source` prop of filter inputs, you can either set it to the field name for simple equality checks or add an operator suffix for more control. For instance, the `gte` (Greater Than or Equal) or the `ilike` (Case insensitive like) operators:

```jsx
const postFilters = [
    <TextInput label="Title" source="title@ilike" alwaysOn />,
    <TextInput label="Views" source="views@gte" />,
];

export const PostList = () => <List filters={postFilters}>...</List>;
```

These operators are available:

| Abbreviation | In PostgreSQL          | Meaning                                                                                                     |
|--------------|------------------------|-------------------------------------------------------------------------------------------------------------|
| eq           | `=`                    | equals                                                                                                      |
| gt           | `>`                    | greater than                                                                                                 |
| gte          | `>=`                   | greater than or equal                                                                                       |
| lt           | `<`                    | less than                                                                                                   |
| lte          | `<=`                   | less than or equal                                                                                          |
| neq          | `<>` or `!=`           | not equal                                                                                                   |
| like         | `LIKE`                 | LIKE operator (to avoid [URL encoding](https://en.wikipedia.org/wiki/Percent-encoding) you can use `*` as an alias of the percent sign `%` for the pattern) |
| ilike        | `ILIKE`                | ILIKE operator (to avoid [URL encoding](https://en.wikipedia.org/wiki/Percent-encoding) you can use `*` as an alias of the percent sign `%` for the pattern) |
| match        | `~`                    | `~` operator                                                                          |
| imatch       | `~*`                   | `~*` operator                                                                         |
| in           | `IN`                   | one of a list of values, e.g. `?a=in.(1,2,3)` – also supports commas in quoted strings like `?a=in.("hi,there","yes,you")` |
| is           | `IS`                   | checking for exact equality (null, true, false, unknown)                                                    |
| isdistinct   | `IS DISTINCT FROM`     | not equal, treating `NULL` as a comparable value                                                            |
| fts          | `@@`                   | full-text search using `to_tsquery`                                                                         |
| plfts        | `@@`                   | full-text search using `plainto_tsquery`                                                                    |
| phfts        | `@@`                   | full-text search using `phraseto_tsquery`                                                                   |
| wfts         | `@@`                   | full-text search using `websearch_to_tsquery`                                                               |
| cs           | `@>`                   | contains e.g. `?tags=cs.{example, new}`                                                                     |
| cd           | `<@`                   | contained in e.g. `?values=cd.{1,2,3}`                                                                      |
| ov           | `&&`                   | overlap (have points in common), e.g. `?period=ov.[2017-01-01,2017-06-30]` – also supports array types, use curly braces instead of square brackets e.g. `?arr=ov.{1,3}` |
| sl           | `<<`                   | strictly left of, e.g. `?range=sl.(1,10)`                                                                   |
| sr           | `>>`                   | strictly right of                                                                                           |
| nxr          | `&<`                   | does not extend to the right of, e.g. `?range=nxr.(1,10)`                                                   |
| nxl          | `&>`                   | does not extend to the left of                                                                              |
| adj          | `-|-`                  | is adjacent to, e.g. `?range=adj.(1,10)`                                                                    |
| not          | `NOT`                  | negates another operator logical operators                                                             |
| or           | `OR`                   | logical `OR`, see logical operators                                                                         |
| and          | `AND`                  | logical `AND`, see logical operators                                                                        |
| all          | `ALL`                  | comparison matches all the values in the list                                                |
| any          | `ANY`                  | comparison matches any value in the list                                                     |

See the [PostgREST documentation](https://postgrest.org/en/stable/api.html#operators) for more details.

### Vertical Filtering & Embedding

Use the `meta.columns` parameter to restrict the columns that you want to fetch:

```jsx
const { data, total, isLoading, error } = useGetList(
    'contact',
    {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'created_at', order: 'DESC' },
        meta: { columns: ['id', 'first_name', 'last_name'] }
    }
);
```

You can leverage this feature to:

- rename columns: `columns: ['id', 'firstName:first_name', 'lastName:last_name']`
- cast columns: `columns: ['id::text', 'first_name', 'last_name']`
- embed relationships: `columns: ['*', 'company:companies(*)']`

The last example will return all columns from the `contact` table and all columns from the `companies` table related to the `contact` table.

```jsx
{
    id: 123,
    first_name: 'John',
    last_name: 'Doe',
    company_id: 456,
    company: {
        id: 456,
        name: 'ACME'
    }
}
```

Tou can leverage this feature to access related data in `Field` component:

```jsx
const ContactShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <TextField source="company.name" />
        </SimpleShowLayout>
    </Show>
);
```

### Null Sort Order

When ordering by a column that contains null values, you can specify whether the null values should be sorted first or last:

```jsx
const { data, total, isLoading, error } = useGetList(
    'posts',
    {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'published_at', order: 'DESC' },
        meta: { nullslast: true }
    }
);
```

You can also set this option globally in the dataProvider:

```jsx
import { PostgRestSortOrder } from '@raphiniert/ra-data-postgrest';

const config = {
    ...
    sortOrder: PostgRestSortOrder.AscendingNullsLastDescendingNullsLast
}

const dataProvider = supabaseDataProvider(config);
```

### Row-Level Security

As users authenticate through supabase, you can leverage [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security). Users identity will be propagated through the dataProvider if you provided the public API (anon) key. Keep in mind that passing the `service_role` key will bypass Row Level Security. This is not recommended.

## Guessers

`ra-supabase` provides alternative guessers for all CRUD pages, leveraging the OpenAPI schema provided by Supabase. Use these guessers instead of react-admin's default guessers for a better first experience.

```jsx
import { Admin, Resource } from 'react-admin';
import { ListGuesser, ShowGuesser, EditGuesser, CreateGuesser } from 'ra-supabase';

export const MyAdmin = () => (
    <BrowserRouter>
        <Admin dataProvider={dataProvider} authProvider={authProvider}>
            <Resource
                name="posts"
                list={ListGuesser}
                show={ShowGuesser}
                edit={EditGuesser}
                create={CreateGuesser}
            />
        </Admin>
    </BrowserRouter>
);
```

## Using Hash Router

Supabase uses URL hash links for its redirections. This can cause conflicts if you use a HashRouter. For this reason, we recommend using the BrowserRouter.

If you want to use the HashRouter, you'll need to modify the code.

1. Create a custom `auth-callback.html` file inside your public folder. This file will intercept the supabase redirect and rewrite the URL to prevent conflicts with the HashRouter. For example, see `packages/demo/public/auth-callback.html`.
2. Remove `BrowserRouter` from your `App.ts`

### Configuring an hosted Supabase instance

3. Go to your Supabase dashboard **Authentication** section
4. In **URL Configuration**, add the following URL in the **Redirect URLs** section: `YOUR_APPLICATION_URL/auth-callback.html`
5. In **Email Templates**, change the `"{{ .ConfirmationURL }}"` to `"{{ .ConfirmationURL }}/auth-callback.html"`

### Configuring a local Supabase instance

3. Go to your `config.toml` file
4. In `[auth]` section set `site_url` to your application URL
5. In `[auth]`, add the following URL in the `additional_redirect_urls = [{APPLICATION_URL}}/auth-callback.html"]`
6. Add an `[auth.email.template.{TYPE}]` section with the following option :

```
[auth.email.template.TYPE]
subject = {TYPE_MESSAGE}
content_path = "./supabase/templates/{TYPE}.html"
```

In `{TYPE}.html` set the `auth-callback` redirection

```HTML
<html>
  <body>
    <h2>{TYPE_MESSAGE}</h2>
    <p><a href="{{ .ConfirmationURL }}/auth-callback.html">{TYPE_CTA}</a></p>
  </body>
</html>
```

## Customizing the dataProvider

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

## Authentication

### Email & Password Authentication

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

### Disabling Email & Password Authentication

If you only want to support [third party OAuth authentication](#oauth-authentication), you can disable email & password authentication by providing a `LoginPage` component:

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
            loginPage={<LoginPage disableEmailPassword providers={['github', 'twitter']} />}
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

#### Configuring a local Supabase instance

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
  </body>
</html>
```

#### Configuring an hosted Supabase instance

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

### Password Reset

If users forgot their password, they can request for a reset if you add the `/forgot-password` custom route. You should also set up the [`/set-password` custom route](#invitation-handling) to allow them to choose their new password.

This requires you to configure your supabase instance:

#### Configuring a local Supabase instance

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

#### Configuring an hosted Supabase instance

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

### OAuth Authentication

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
            // You can also disable email & password authentication
            loginPage={<LoginPage disableEmailPassword providers={['github', 'twitter']} />}
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

#### Configuring a local Supabase instance

1. Go to your `config.toml` file
2. In `[auth]` section set `site_url` to your application URL
3. In `[auth]`, add the following URL in the `additional_redirect_urls = [{APPLICATION_URL}}/auth-callback"]`

#### Configuring an hosted Supabase instance

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
