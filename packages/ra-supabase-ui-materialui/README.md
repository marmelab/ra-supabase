# ra-supabase-ui-materialui

This package provides components to integrate [Supabase](https://supabase.io/) with [react-admin](https://marmelab.com/react-admin) when using its default UI ([ra-ui-materialui](https://github.com/marmelab/react-admin/tree/master/packages/ra-ui-materialui)).

## Installation

```sh
yarn add ra-supabase-ui-materialui
# or
npm install ra-supabase-ui-materialui
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
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, ResetPasswordPage, SetPasswordPage } from 'ra-supabase-ui-materialui';
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


## API

### `<AuthLayout>`

This component provides a layout for authentication pages very similar to the one used in the default React Admin `<LoginPage>`. However, it does not check the user authentication status. It is used by both the `<LoginPage>` component.

### `<LoginPage>`

This is `ra-supabase-ui-materialui` version of the `<LoginPage>` that redirects users to the admin home page if they are already logged in and displays the `<LoginForm>` otherwise. You may provide your own form by passing it as the `<LoginPage>` child.

It supports OAuth authentication. Specify the available OAuth providers using the `providers` prop:

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

You can disable email/password authentication by setting the `disableEmailPassword` prop:

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

### `<LoginForm>`

This is `ra-supabase-ui-materialui` version of the `<LoginForm>` that contains an email and password fields. It is exported for you to reuse in a custom login page when needed.

### `<ResetPasswordPage>`

A page component to use in a custom route to allow users to reset their passwords.

```jsx
// in App.js
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, ResetPasswordPage, SetPasswordPage } from 'ra-supabase-ui-materialui';
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

Users will be asked for an email and the component will send a reset password request to Supabase.

You should also set up the [`<SetPasswordPage>`](#setpasswordpage) to allow users to actually set a new password.

### `<SetPasswordPage>`

A page component to use in a custom route to allow users to set their passwords. Can be used for users following an invitation link so that they can set their password for the first time or for [password reset](#resetpasswordpage).

```jsx
// in App.js
import { Admin, CustomRoutes, Resource, ListGuesser } from 'react-admin';
import { LoginPage, ResetPasswordPage, SetPasswordPage } from 'ra-supabase-ui-materialui';
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

You should also set up the [`<ResetPasswordPage>`](#resetpasswordpage) to allow users to reset a new password in case they forgot it.

### `<SocialAuthButton>`

A button allowing to login using an OAuth provider. Even though we provide buttons for each currently supported provider (`<AppleButton>`, etc.), you can add new ones before we update the package with this button:

```jsx
import { useTranslate } from 'react-admin';
import { SocialAuthButton } from 'ra-supabase-ui-materialui';
import WonderfulNewServiceIcon from './WonderfulNewServiceIcon';

export const WonderfulNewServiceButton = (props) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Wonderful New Service',
    });

    return (
        <SocialAuthButton startIcon={<WonderfulNewServiceIcon />} provider="wonderfulnewservice" {...props}>
            {label}
        </SocialAuthButton>
    );
};
```

We provide the following OAuth buttons:
- `<AppleButton>`
- `<AzureButton>`
- `<BitbucketButton>`
- `<DiscordButton>`
- `<FacebookButton>`
- `<GitlabButton>`
- `<GithubButton>`
- `<GoogleButton>`
- `<KeycloakButton>`
- `<LinkedInButton>`
- `<NotionButton>`
- `<SlackButton>`
- `<SpotifyButton>`
- `<TwitchButton>`
- `<TwitterButton>`
- `<WorkosButton>`

## Roadmap

-   Add support for magic link authentication
