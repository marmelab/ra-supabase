import { AuthProvider, UserIdentity } from 'ra-core';
import { Provider, SupabaseClient, User } from '@supabase/supabase-js';

export const supabaseAuthProvider = (
    client: SupabaseClient,
    { getIdentity }: SupabaseAuthProviderOptions
): SupabaseAuthProvider => {
    return {
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
                client.auth.signInWithOAuth(oauthParams);
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
            if (error.status === 401 || error.status === 403) {
                return Promise.reject();
            }

            return Promise.resolve();
        },
        async handleCallback() {
            const urlSearchParams = new URLSearchParams(
                window.location.hash.substring(1)
            );

            const access_token = urlSearchParams.get('access_token');
            const refresh_token = urlSearchParams.get('refresh_token');
            const type = urlSearchParams.get('type');

            // Users have reset their password or have just been invited and must set a new password
            if (type === 'recovery' || type === 'invite') {
                if (access_token && refresh_token) {
                    // eslint-disable-next-line no-throw-literal
                    return {
                        redirectTo: `set-password?access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`,
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
            if (window.location.pathname === '/set-password') {
                return;
            }
            // Users are on the forgot-password page, nothing to do
            if (window.location.pathname === '/forgot-password') {
                return;
            }

            const urlSearchParams = new URLSearchParams(
                window.location.hash.substring(1)
            );

            const access_token = urlSearchParams.get('access_token');
            const refresh_token = urlSearchParams.get('refresh_token');
            const type = urlSearchParams.get('type');

            // Users have reset their password or have just been invited and must set a new password
            if (type === 'recovery' || type === 'invite') {
                if (access_token && refresh_token) {
                    // eslint-disable-next-line no-throw-literal
                    throw {
                        redirectTo: `set-password?access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`,
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
        async getPermissions() {
            return;
        },
        async getIdentity() {
            const { data } = await client.auth.getUser();

            if (data.user == null) {
                throw new Error();
            }

            if (typeof getIdentity === 'function') {
                const identity = await getIdentity(data.user);
                return identity;
            }

            return undefined;
        },
    };
};

export type GetIdentity = (user: User) => Promise<UserIdentity>;
export type SupabaseAuthProviderOptions = {
    getIdentity?: GetIdentity;
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
