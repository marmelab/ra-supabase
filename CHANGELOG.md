# 2.0.3

- Fix wrong build in 2.0.2

# 2.0.2

- Merge supabaseClient headers into postgREST requests ([#33](https://github.com/marmelab/ra-supabase/pull/33)) [milutinovici](https://github.com/milutinovici)

# 2.0.1

- Fix invitations and password reset handling

# 2.0.0

- Add compatibility with react-admin v4
- Use [`ra-data-postgrest`](https://github.com/raphiniert-com/ra-data-postgrest/tree/v2.0.0-alpha.0) for the dataProvider
- Add support for third party authentication providers

## Migration

### DataProvider

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
