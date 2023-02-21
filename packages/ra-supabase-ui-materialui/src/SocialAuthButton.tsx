import * as React from 'react';
import { Provider } from '@supabase/supabase-js';
import { Button, ButtonProps } from '@mui/material';
import { useLogin, useNotify, useTranslate } from 'ra-core';
import {
    AppleIcon,
    AzureIcon,
    BitbucketIcon,
    DiscordIcon,
    FacebookIcon,
    GithubIcon,
    GitlabIcon,
    GoogleIcon,
    KeycloakIcon,
    LinkedinIcon,
    NotionIcon,
    SlackIcon,
    SpotifyIcon,
    TwitchIcon,
    TwitterIcon,
    WorkosIcon,
} from './icons';

export const SocialAuthButton = ({
    provider,
    redirect: redirectTo,
    ...props
}: SocialAuthButtonProps) => {
    const login = useLogin();
    const notify = useNotify();

    const handleClick = () => {
        login({ provider }, redirectTo ?? window.location.toString()).catch(
            error => {
                // The authProvide always reject for OAuth login but there will be no error
                // if the call actually succeeds. This is to avoid react-admin redirecting
                // immediately to the provided redirect prop before users are redirected to
                // the OAuth provider.
                if (error) {
                    notify((error as Error).message, { type: 'error' });
                }
            }
        );
    };

    return (
        <Button
            onClick={handleClick}
            variant="contained"
            size="medium"
            color="inherit"
            {...props}
        />
    );
};

export type SocialAuthButtonProps = {
    provider: Provider;
    redirect?: string;
} & ButtonProps;

export const AppleButton = (props: Omit<SocialAuthButtonProps, 'provider'>) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Apple',
    });

    return (
        <SocialAuthButton startIcon={<AppleIcon />} provider="apple" {...props}>
            {label}
        </SocialAuthButton>
    );
};

export const AzureButton = (props: Omit<SocialAuthButtonProps, 'provider'>) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Azure',
    });

    return (
        <SocialAuthButton startIcon={<AzureIcon />} provider="azure" {...props}>
            {label}
        </SocialAuthButton>
    );
};

export const BitbucketButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Bitbucket',
    });

    return (
        <SocialAuthButton
            startIcon={<BitbucketIcon />}
            provider="bitbucket"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const DiscordButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Discord',
    });

    return (
        <SocialAuthButton
            startIcon={<DiscordIcon />}
            provider="discord"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const FacebookButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Facebook',
    });

    return (
        <SocialAuthButton
            startIcon={<FacebookIcon />}
            provider="facebook"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const GitlabButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Gitlab',
    });

    return (
        <SocialAuthButton
            startIcon={<GitlabIcon />}
            provider="gitlab"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const GithubButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Github',
    });

    return (
        <SocialAuthButton
            startIcon={<GithubIcon />}
            provider="github"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const GoogleButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Google',
    });

    return (
        <SocialAuthButton
            startIcon={<GoogleIcon />}
            provider="google"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const KeycloakButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Keycloak',
    });

    return (
        <SocialAuthButton
            startIcon={<KeycloakIcon />}
            provider="keycloak"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const LinkedInButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'LinkedIn',
    });

    return (
        <SocialAuthButton
            startIcon={<LinkedinIcon />}
            provider="linkedin"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const NotionButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Notion',
    });

    return (
        <SocialAuthButton
            startIcon={<NotionIcon />}
            provider="notion"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const SlackButton = (props: Omit<SocialAuthButtonProps, 'provider'>) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Slack',
    });

    return (
        <SocialAuthButton startIcon={<SlackIcon />} provider="slack" {...props}>
            {label}
        </SocialAuthButton>
    );
};

export const SpotifyButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Spotify',
    });

    return (
        <SocialAuthButton
            startIcon={<SpotifyIcon />}
            provider="spotify"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const TwitchButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Twitch',
    });

    return (
        <SocialAuthButton
            startIcon={<TwitchIcon />}
            provider="twitch"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const TwitterButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'Twitter',
    });

    return (
        <SocialAuthButton
            startIcon={<TwitterIcon />}
            provider="twitter"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};

export const WorkosButton = (
    props: Omit<SocialAuthButtonProps, 'provider'>
) => {
    const translate = useTranslate();
    const label = translate('ra-supabase.auth.sign_in_with', {
        provider: 'WorkOS',
    });

    return (
        <SocialAuthButton
            startIcon={<WorkosIcon />}
            provider="workos"
            {...props}
        >
            {label}
        </SocialAuthButton>
    );
};
