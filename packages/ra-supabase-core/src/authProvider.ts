import { Provider, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthProvider, UserIdentity } from 'ra-core';
import { getSearchString } from './getSearchString';

export const supabaseAuthProvider = (
    client: SupabaseClient,
    { getIdentity, getPermissions, redirectTo }: SupabaseAuthProviderOptions
): SupabaseAuthProvider => {
    const authProvider: SupabaseAuthProvider = {
        async login(params) {
            const emailPasswordParams = params as LoginWithEmailPasswordParams;
            if (emailPasswordParams.email && emailPasswordParams.password) {
                const { error } = await client.auth.signInWithPassword(
                    emailPasswordParams
                );

                if (error) {
                    throw error;
                }

                return;
            }

            const oauthParams = params as LoginWithOAuthParams;
            if (oauthParams.provider) {
                client.auth.signInWithOAuth({
                    ...oauthParams,
                    options: { redirectTo },
                });
                // To avoid react-admin to consider this as an immediate success,
                // we return a rejected promise that is handled by the default OAuth login buttons
                return Promise.reject();
            }
            return Promise.reject(new Error('Invalid login parameters'));
        },
        async setPassword({
            access_token,
            refresh_token,
            password,
        }: SetPasswordParams) {
            const { error: sessionError } = await client.auth.setSession({
                access_token,
                refresh_token,
            });

            if (sessionError) {
                throw sessionError;
            }
            const { error } = await client.auth.updateUser({
                password,
            });

            if (error) {
                throw error;
            }
            return undefined;
        },
        async resetPassword(params: ResetPasswordParams) {
            const { email, ...options } = params;

            const { error } = await client.auth.resetPasswordForEmail(
                email,
                options
            );

            if (error) {
                throw error;
            }
            return undefined;
        },
        async logout() {
            const { error } = await client.auth.signOut();
            if (error) {
                throw error;
            }
        },
        async checkError(error) {
            if (
                error.status === 401 ||
                error.status === 403 ||
                // Supabase returns 400 when the session is missing, we need to check this case too.
                (error.status === 400 &&
                    error.name === 'AuthSessionMissingError')
            ) {
                return Promise.reject();
            }

            return Promise.resolve();
        },
        async handleCallback() {
            const { access_token, refresh_token, type } = getUrlParams();

            // Users have reset their password or have just been invited and must set a new password
            if (type === 'recovery' || type === 'invite') {
                if (access_token && refresh_token) {
                    return {
                        redirectTo: () => ({
                            pathname: redirectTo
                                ? `${redirectTo}/set-password`
                                : '/set-password',
                            search: `access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`,
                        }),
                    };
                }

                if (process.env.NODE_ENV === 'development') {
                    console.error(
                        'Missing access_token or refresh_token for an invite or recovery'
                    );
                }
            }
        },
        async checkAuth() {
            // Users are on the set-password page, nothing to do
            if (
                window.location.pathname === '/set-password' ||
                window.location.hash.includes('#/set-password')
            ) {
                return;
            }
            // Users are on the forgot-password page, nothing to do
            if (
                window.location.pathname === '/forgot-password' ||
                window.location.hash.includes('#/forgot-password')
            ) {
                return;
            }

            const { access_token, refresh_token, type } = getUrlParams();
            // Users have reset their password or have just been invited and must set a new password
            if (type === 'recovery' || type === 'invite') {
                if (access_token && refresh_token) {
                    // eslint-disable-next-line no-throw-literal
                    throw {
                        redirectTo: () => ({
                            pathname: redirectTo
                                ? `${redirectTo}/set-password`
                                : '/set-password',
                            search: `access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`,
                        }),
                        message: false,
                    };
                }

                if (process.env.NODE_ENV === 'development') {
                    console.error(
                        'Missing access_token or refresh_token for an invite or recovery'
                    );
                }
            }

            const { data } = await client.auth.getSession();
            if (data.session == null) {
                return Promise.reject();
            }

            return Promise.resolve();
        },
    };

    if (typeof getPermissions === 'function') {
        authProvider.getPermissions = async () => {
            // No permissions when users are on the set-password page
            // or on the forgot-password page.
            if (
                window.location.pathname === '/set-password' ||
                window.location.hash.includes('#/set-password') ||
                window.location.pathname === '/forgot-password' ||
                window.location.hash.includes('#/forgot-password')
            ) {
                return;
            }

            const { data, error } = await client.auth.getUser();
            if (error || data.user == null) return;

            return getPermissions(data.user);
        };
    }

    if (typeof getIdentity === 'function') {
        authProvider.getIdentity = async () => {
            const { data } = await client.auth.getUser();
            if (data.user == null) {
                throw new Error();
            }

            const identity = await getIdentity(data.user);
            return identity;
        };
    }

    return authProvider;
};

export type GetIdentity = (user: User) => Promise<UserIdentity>;
export type GetPermissions = (user: User) => Promise<any>;
export type SupabaseAuthProviderOptions = {
    getIdentity?: GetIdentity;
    getPermissions?: GetPermissions;
    redirectTo?: string;
};

type LoginWithEmailPasswordParams = {
    email: string;
    password: string;
};

type LoginWithOAuthParams = {
    provider: Provider;
};

type LoginWithMagicLink = {
    email: string;
};

export interface SupabaseAuthProvider extends AuthProvider {
    login: (
        params:
            | LoginWithEmailPasswordParams
            | LoginWithMagicLink
            | LoginWithOAuthParams
    ) => ReturnType<AuthProvider['login']>;
    setPassword: (params: SetPasswordParams) => Promise<void>;
    resetPassword: (params: ResetPasswordParams) => Promise<void>;
}

export type SetPasswordParams = {
    access_token: string;
    refresh_token: string;
    password: string;
};

export type ResetPasswordParams = {
    email: string;
    redirectTo?: string;
    captchaToken?: string;
};

const getUrlParams = () => {
    const searchStr = getSearchString();
    const urlSearchParams = new URLSearchParams(searchStr);
    const access_token = urlSearchParams.get('access_token');
    const refresh_token = urlSearchParams.get('refresh_token');
    const type = urlSearchParams.get('type');

    return { access_token, refresh_token, type };
};
