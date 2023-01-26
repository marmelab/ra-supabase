import { AuthProvider, UserIdentity } from 'ra-core';
import { SupabaseClient, User } from '@supabase/supabase-js';

export const supabaseAuthProvider = (
    client: SupabaseClient,
    { getIdentity }: SupabaseAuthProviderOptions
): SupabaseAuthProvider => ({
    async login({ email, password }: { email: string; password: string }) {
        const { error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
        return undefined;
    },
    async setPassword({
        access_token,
        password,
    }: {
        access_token: string;
        password: string;
    }) {
        const { error } = await client.auth.updateUser({
            password,
        });

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
    async checkAuth() {
        // Users are on the set-password page, nothing to do
        if (window.location.pathname === '/set-password') {
            return;
        }

        const urlSearchParams = new URLSearchParams(
            window.location.hash.substr(1)
        );

        const access_token = urlSearchParams.get('access_token');
        const type = urlSearchParams.get('type');

        // Users have reset their password and must set a new one
        if (access_token && type === 'recovery') {
            // eslint-disable-next-line no-throw-literal
            throw new CheckAuthError(
                'Users have reset their password and must set a new one',
                `set-password?access_token=${access_token}`
            );
        }

        // Users have have been invited and must set their password
        if (access_token && type === 'invite') {
            // eslint-disable-next-line no-throw-literal
            throw new CheckAuthError(
                'Users have have been invited and must set their password',
                `set-password?access_token=${access_token}`
            );
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
});

class CheckAuthError extends Error {
    redirectTo: string;

    constructor(message: string, redirectTo: string) {
        super(message);
        this.redirectTo = redirectTo;
    }
}

export type GetIdentity = (user: User) => Promise<UserIdentity>;
export type SupabaseAuthProviderOptions = {
    getIdentity?: GetIdentity;
};

export interface SupabaseAuthProvider extends AuthProvider {
    setPassword: (params: SetPasswordParams) => Promise<void>;
}

export type SetPasswordParams = { access_token: string; password: string };
