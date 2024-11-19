# ra-supabase

This package provides a dataProvider, an authProvider, hooks and components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

[![Video]][VideoLink] 
[![Documentation]][DocumentationLink] 
[![Source Code]][SourceCodeLink] 

[Video]: https://img.shields.io/badge/Video-darkmagenta?style=for-the-badge
[Documentation]: https://img.shields.io/badge/Documentation-darkgreen?style=for-the-badge
[Source Code]: https://img.shields.io/badge/Source_Code-blue?style=for-the-badge

[VideoLink]: https://youtu.be/zV-Ty7VeIvo 'Video'
[DocumentationLink]: ./packages/ra-supabase/README.md 'Documentation'
[SourceCodeLink]: https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase 'Source Code'

[![Video tutorial about react-admin with supabase](./assets/video.jpg)](https://youtu.be/zV-Ty7VeIvo)

## Projects

- [ra-supabase](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase): Umbrella project that re-export the others.
- [ra-supabase-core](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-core): Provide the dataProvider, authProvider and some hooks
- [ra-supabase-ui-materialui](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-ui-materialui): Provide the LoginPage and Social authentication buttons
- [ra-supabase-language-english](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-english): Provide the english translations
- [ra-supabase-language-french](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-french): Provide the french translations

## Roadmap

-   Add support for magic link authentication
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

Log in with the following credentials:

- Email: `janedoe@atomic.dev`
- Password: `password`

If you need debug the backend, you can access the following services: 

- Supabase dashboard: [http://localhost:54323/](http://localhost:54323/)
- REST API: [http://127.0.0.1:54321](http://127.0.0.1:54321)
- Attachments storage: [http://localhost:54323/project/default/storage/buckets/attachments](http://localhost:54323/project/default/storage/buckets/attachments)
- Inbucket email testing service: [http://localhost:54324/](http://localhost:54324/)

### Testing Invitations And Password Reset

When you invite a new user through the [Authentication dashboard](http://localhost:54323/project/default/auth/users), or reset a password through the [password reset form](http://localhost:8000/forgot-password), you can see the email sent in [Inbucket](http://localhost:54324/monitor).

Clicking the link inside the email will take you to the `/set-password` page where you can set or reset your password.

### Testing Third Party Authentication Providers

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

## Internationalization Support

We provide two language packages:

-   [ra-supabase-language-english](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-english)
-   [ra-supabase-language-french](https://github.com/marmelab/ra-supabase/tree/main/packages/ra-supabase-language-french)

And there are also community supported language packages:
-   [ra-supabase-language-spanish](https://github.com/dreinon/ra-supabase-language-spanish)

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
