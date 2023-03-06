# ra-supabase

This package provides a dataProvider, an authProvider, hooks and components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

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

### Testing Invitations And Password Reset

The current version of supabase CLI does not allow to customize the emails sent for invitation or password reset.

When you invite a new user through the [Authentication dashboard](http://localhost:54323/project/default/auth/users), you can see the email sent in [Inbucket](http://localhost:54324/monitor). Instead of clicking the link, copy it and change the `redirect_to` parameter from `http://localhost:8000` to `http://localhost:8000/handle-callback`.

Apply the same process for password reset emails.

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