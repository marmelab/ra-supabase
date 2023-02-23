import * as React from 'react';
import { ReactNode } from 'react';

import { useRedirectIfAuthenticated } from 'ra-supabase-core';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { Provider } from '@supabase/supabase-js';
import { Divider, Stack } from '@mui/material';
import {
    AppleButton,
    AzureButton,
    BitbucketButton,
    DiscordButton,
    FacebookButton,
    GithubButton,
    GitlabButton,
    GoogleButton,
    KeycloakButton,
    LinkedInButton,
    NotionButton,
    SlackButton,
    SpotifyButton,
    TwitchButton,
    TwitterButton,
    WorkosButton,
} from './SocialAuthButton';

export const LoginPage = (props: LoginPageProps) => {
    useRedirectIfAuthenticated();
    const { children, disableEmailPassword = false, providers = [] } = props;

    return (
        <AuthLayout>
            {children ?? (
                <>
                    {disableEmailPassword ? null : <LoginForm />}
                    {disableEmailPassword || providers.length === 0 ? null : (
                        <Divider />
                    )}
                    {providers && providers.length > 0 ? (
                        <>
                            <Stack gap={1} padding={1}>
                                {providers.includes('apple') ? (
                                    <AppleButton />
                                ) : null}
                                {providers.includes('azure') ? (
                                    <AzureButton />
                                ) : null}
                                {providers.includes('bitbucket') ? (
                                    <BitbucketButton />
                                ) : null}
                                {providers.includes('discord') ? (
                                    <DiscordButton />
                                ) : null}
                                {providers.includes('facebook') ? (
                                    <FacebookButton />
                                ) : null}
                                {providers.includes('gitlab') ? (
                                    <GitlabButton />
                                ) : null}
                                {providers.includes('github') ? (
                                    <GithubButton />
                                ) : null}
                                {providers.includes('google') ? (
                                    <GoogleButton />
                                ) : null}
                                {providers.includes('keycloak') ? (
                                    <KeycloakButton />
                                ) : null}
                                {providers.includes('linkedin') ? (
                                    <LinkedInButton />
                                ) : null}
                                {providers.includes('notion') ? (
                                    <NotionButton />
                                ) : null}
                                {providers.includes('slack') ? (
                                    <SlackButton />
                                ) : null}
                                {providers.includes('spotify') ? (
                                    <SpotifyButton />
                                ) : null}
                                {providers.includes('twitch') ? (
                                    <TwitchButton />
                                ) : null}
                                {providers.includes('twitter') ? (
                                    <TwitterButton />
                                ) : null}
                                {providers.includes('workos') ? (
                                    <WorkosButton />
                                ) : null}
                            </Stack>
                        </>
                    ) : null}
                </>
            )}
        </AuthLayout>
    );
};

export type LoginPageProps = {
    children?: ReactNode;
    disableEmailPassword?: boolean;
    providers?: Provider[];
};
