# Changelog

## 3.4.1

- Improve authentication related pages UX by showing the loading state ([#88](https://github.com/marmelab/ra-supabase/pull/88)) ([djhi](https://github.com/djhi))
- Fix generated representation for `<AutocompleteInput>` and `<AutocompleteArrayInput>` ([#86](https://github.com/marmelab/ra-supabase/pull/86)) ([slax57](https://github.com/slax57))
- Improve Reference inputs guessers ([#85](https://github.com/marmelab/ra-supabase/pull/85)) ([djhi](https://github.com/djhi))
- Update `LoginPage` to use React admin Login component ([#84](https://github.com/marmelab/ra-supabase/pull/84)) ([fzaninotto](https://github.com/fzaninotto))

## 3.4.0

- Add support for React 19, react-router v7 and MUI v6, and update react-admin peer dependency to v5.5 ([#83](https://github.com/marmelab/ra-supabase/pull/83)) ([djhi](https://github.com/djhi))

## 3.3.1

- Fix `<AdminGuesser>` type is missing the required API connection strings ([fzaninotto](https://github.com/fzaninotto))
- Fix `@raphiniert/ra-data-postgrest` and `@supabase/supabase-js` dependencies are missing ([fzaninotto](https://github.com/fzaninotto))

## 3.3.0

- Add `<AdminGuesser>` for a zero-config application scaffolding based on the OpenAPI Schema ([#80](https://github.com/marmelab/ra-supabase/pull/80)) ([fzaninotto](https://github.com/fzaninotto))
- Add `<ListGuesser>`, `<ShowGuesser>`, `<EditGuesser>`, and `<CreateGuesser>` to automatically generate page components based on the OpenAPI Schema ([#80](https://github.com/marmelab/ra-supabase/pull/80)) ([fzaninotto](https://github.com/fzaninotto))

## 3.2.1

* Fix `authProvider.getPermissions()` should not throw error when not logged in ([#79](https://github.com/marmelab/ra-supabase/pull/79)) ([fzaninotto](https://github.com/fzaninotto))
* [Doc] Improve email setup instructions ([#78](https://github.com/marmelab/ra-supabase/pull/78)) ([djhi](https://github.com/djhi))
* [Demo] Configure local Supabase instance to support invitation and password reset out of the box ([#77](https://github.com/marmelab/ra-supabase/pull/77)) ([slax57](https://github.com/slax57))

## 3.2.0

* Add ability to pass additional options to postgrest ([#74](https://github.com/marmelab/ra-supabase/pull/74)) ([fzaninotto](https://github.com/fzaninotto))
* Fix Reset Password form doesn't redirect to login page ([#75](https://github.com/marmelab/ra-supabase/pull/75)) ([fzaninotto](https://github.com/fzaninotto))
* Improve UI of set password & reset password pages ([#76](https://github.com/marmelab/ra-supabase/pull/76)) ([fzaninotto](https://github.com/fzaninotto))
* [Doc] Fix example in material UI readme ([#73](https://github.com/marmelab/ra-supabase/pull/73)) ([Patys](https://github.com/Patys))
* [Doc] Fix code in dataProvider example in readme ([#72](https://github.com/marmelab/ra-supabase/pull/72)) ([Patys](https://github.com/Patys))
* [Doc] Align style in readme for language packages([#71](https://github.com/marmelab/ra-supabase/pull/71)) ([Patys](https://github.com/Patys))

## 3.1.1

* Fix: Remove 'save' icon from 'Reset password' and 'Sign In' buttons ([#69](https://github.com/marmelab/ra-supabase/pull/69)) ([jonathan-marmelab](https://github.com/jonathan-marmelab))
* Fix: Improve wording on 'set password' and 'password reset' forms ([#68](https://github.com/marmelab/ra-supabase/pull/68)) ([jonathan-marmelab](https://github.com/jonathan-marmelab))

## 3.1.0

* Feat: Handle `HashRouter` & `BrowserRouter` for Supabase redirections ([#67](https://github.com/marmelab/ra-supabase/pull/67)) ([arimet](https://github.com/arimet))
* Fix: It is no longer possible to access a page using direct URL if user is logged out ([#65](https://github.com/marmelab/ra-supabase/pull/65)) ([jonathan-marmelab](https://github.com/jonathan-marmelab))

## 3.0.0

* Upgrade to react-admin v5 ([#61](https://github.com/marmelab/ra-supabase/pull/61)) ([mrkpatchaa](https://github.com/mrkpatchaa))
* Bump ra-data-postgrest to 2.3.0 ([#62](https://github.com/marmelab/ra-supabase/pull/62)) ([slax57](https://github.com/slax57))
* Enable strictNullChecks ([#63](https://github.com/marmelab/ra-supabase/pull/63)) ([djhi](https://github.com/djhi))
* Update demo ([#59](https://github.com/marmelab/ra-supabase/pull/59)) ([erwanMarmelab](https://github.com/erwanMarmelab))

- The `<LoginPage>` will no longer automatically redirect to the app if the user is already authenticated

## 2.3.0

* Update supabase-js dev to match new auth system ([#55](https://github.com/marmelab/ra-supabase/pull/55)) ([Revarh](https://github.com/Revarh))
* [TypeScript] Allow react-router To type for UseRedirectIfAuthenticatedOptions ([#56](https://github.com/marmelab/ra-supabase/pull/56)) ([MohammedFaragallah](https://github.com/MohammedFaragallah))

## 2.2.0

- Add `getPermissions` support in `authProvider`

## 2.1.0

* Update to latest ra-data-postgrest ([#47](https://github.com/marmelab/ra-supabase/pull/47)) ([slax57](https://github.com/slax57))

## 2.0.6

- Fixes set password flow doesn't work ([#44](https://github.com/marmelab/ra-supabase/pull/44)) [n0rmanc](https://github.com/n0rmanc)

## 2.0.5

- Fix ra-supabase-language-french main export should be named raSupabaseFrenchMessages ([#43](https://github.com/marmelab/ra-supabase/pull/43)) [vicam001](https://github.com/vicam001)

## 2.0.4

- Add support for `redirectTo` in `supabaseAuthProvider`
- Document spanish translations

## 2.0.3

- Fix wrong build in 2.0.2

## 2.0.2

- Merge supabaseClient headers into postgREST requests ([#33](https://github.com/marmelab/ra-supabase/pull/33)) [milutinovici](https://github.com/milutinovici)

## 2.0.1

- Fix invitations and password reset handling

## 2.0.0

- Add compatibility with react-admin v4
- Use [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest/tree/v2.0.0-alpha.0) for the dataProvider
- Add support for third party authentication providers

### Migration

#### DataProvider

As we now use [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest/tree/v2.0.0-alpha.0), you now longer need to describe your resources. However, you must now pass the `supabaseInstanceUrl` and the `apiKey`:

```diff
// in dataProvider.js
import { supabaseDataProvider } from 'ra-supabase-core';
import { supabaseClient } from './supabase';

-const resources = {
-    posts: ['id', 'title', 'body', 'author_id', 'date'],
-    authors: ['id', 'full_name'],
-};

-export const dataProvider = supabaseDataProvider(supabaseClient, resources);
+export const dataProvider = supabaseDataProvider({
+    instanceUrl: 'YOUR_SUPABASE_URL',
+    apiKey: 'YOUR_SUPABASE_ANON_KEY',
+    supabaseClient
+});
```

When specifying the `source` prop of filter inputs, you can now either set it to the field name for simple equality checks or add an operator suffix for more control. For instance, the `gte` (Greater Than or Equal) or the `ilike` (Case insensitive like) operators:

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

We used to have full-text search support that required a special configuration:

```jsx
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

This is now longer required as you can use [PostgREST operators](https://postgrest.org/en/stable/api.html#full-text-search) for this purpose (`fts`, `plfts` and `wfts`). However this means the field on which you apply those operators must be of type [`tsvector`](https://www.postgresql.org/docs/current/datatype-textsearch.html#DATATYPE-TSQUERY). You can follow [Supabase documentation](https://supabase.com/docs/guides/database/full-text-search#creating-indexes) to create one.

Here's how to add a `SearchInput` for such a column:

```jsx
<SearchInput source="fts@my_column" />
```
