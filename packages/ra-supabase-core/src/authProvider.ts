import { Factor, Provider, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthProvider, UserIdentity } from 'ra-core';
import { getSearchString } from './getSearchString';

export const supabaseAuthProvider = (
    client: SupabaseClient,
    {
        getIdentity,
        getPermissions,
        redirectTo,
        enforceMFA,
    }: SupabaseAuthProviderOptions
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

            if (enforceMFA) {
                const { data, error } =
                    await client.auth.mfa.getAuthenticatorAssuranceLevel();
                if (error) {
                    throw error;
                }
                const { currentLevel, nextLevel } = data;
                if (currentLevel === 'aal1') {
                    if (nextLevel === 'aal1') {
                        // User has not yet enrolled in MFA
                        // eslint-disable-next-line no-throw-literal
                        throw {
                            redirectTo: () => ({
                                pathname: redirectTo
                                    ? `${redirectTo}/mfa-enroll`
                                    : '/mfa-enroll',
                            }),
                            message: false,
                        };
                    }
                    if (nextLevel === 'aal2') {
                        // User has an MFA factor enrolled but has not verified it.
                        // eslint-disable-next-line no-throw-literal
                        throw {
                            redirectTo: () => ({
                                pathname: redirectTo
                                    ? `${redirectTo}/mfa-challenge`
                                    : '/mfa-challenge',
                            }),
                            message: false,
                        };
                    }
                }
            }

            return Promise.resolve();
        },
        async getPermissions() {
            if (typeof getPermissions !== 'function') {
                return;
            }
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
            if (error || data.user == null) {
                return;
            }

            const permissions = await getPermissions(data.user);
            return permissions;
        },
        async mfaEnroll({
            factorType,
        }: MFAEnrollParams): Promise<MFAEnrollResult> {
            if (factorType === 'phone') {
                throw new Error(
                    'Phone MFA is not supported yet. Please use TOTP instead.'
                );
            }
            const { data, error } = await client.auth.mfa.enroll({
                factorType,
            });
            if (error) {
                throw error;
            }
            return data;
        },
        async mfaUnenroll({
            factorId,
        }: MFAUnenrollParams): Promise<MFAUnenrollResult> {
            const { data, error } = await client.auth.mfa.unenroll({
                factorId,
            });
            if (error) {
                throw error;
            }
            return data;
        },
        async mfaChallengeAndVerify({
            factorId,
            code,
        }: MFAChallengeAndVerifyParams): Promise<MFAChallengeAndVerifyResult> {
            const { data, error } = await client.auth.mfa.challengeAndVerify({
                factorId,
                code,
            });
            if (error) {
                throw error;
            }
            return data;
        },
        async mfaListFactors(): Promise<MFAListFactorsResult> {
            const { data, error } = await client.auth.mfa.listFactors();
            if (error) {
                throw error;
            }
            return data;
        },
    };

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
    enforceMFA?: boolean;
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

export type MFAEnrollParams = {
    factorType: 'totp' | 'phone';
};

export type MFAEnrollResult = {
    id: string;
    type: 'totp';
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
    friendly_name?: string;
};

export type MFAUnenrollParams = {
    factorId: string;
};

export type MFAUnenrollResult = {
    id: string;
};

export type MFAChallengeAndVerifyParams = {
    factorId: string;
    code: string;
};

export type MFAChallengeAndVerifyResult = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    user: User;
};

export type MFAListFactorsResult = {
    all: Factor[];
    totp: Factor[];
    phone: Factor[];
};

const getUrlParams = () => {
    const searchStr = getSearchString();
    const urlSearchParams = new URLSearchParams(searchStr);
    const access_token = urlSearchParams.get('access_token');
    const refresh_token = urlSearchParams.get('refresh_token');
    const type = urlSearchParams.get('type');

    return { access_token, refresh_token, type };
};
