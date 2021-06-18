# ra-supabase

Supabase Data Provider for [react-admin](https://github.com/marmelab/react-admin), the frontend framework for building admin applications on top of REST/GraphQL services.

## Installation

```sh
npm install --save ra-supabase
```

## Usage

```jsx
import { createClient } from "@supabase/supabase-js";
import { supabaseDataProvider } from "ra-supabase";

const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const resources = {
  // Define the resource by passing its fields as an array
  posts: ["id", "title", "created_at"],
  // Or as an object
  tags: {
    fields: ["id", "name", "created_at"],
    // This allows you to customize on which fields react-admin will do a full-text search
    fullTextSearchFields: ["name"],
  },
};

export const dataProvider = supabaseDataProvider(supabase, resources);
```

## Resources Configuration

Supabase requires a list of fields to query. This is why you have to provide the supported resources and their fields.

You can define the resources as a simple array of field names:

```jsx
const resources = {
  posts: ["id", "title", "created_at"],
};
```

However, you might want to support `q` filters for [full text search](https://marmelab.com/react-admin/List.html#full-text-search) accross multiple fields. To ensure you don't try to apply a full text search on incompatible fields, you may want to define them:

```jsx
const resources = {
  tags: {
    fields: ["id", "name", "created_at"],
    fullTextSearchFields: ["name"],
  },
};
```

## Roadmap

- [ ] Add an authProvider with configurable support for supabase authentication methods
- [ ] Add support for proper fulltext search https://supabase.io/docs/reference/javascript/textsearch
