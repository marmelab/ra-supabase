import { AuthProvider, UserIdentity } from 'ra-core';
import { SupabaseClient, User } from '@supabase/supabase-js';

export const supabaseAuthProvider = (
    client: SupabaseClient,
    { getIdentity }: SupabaseAuthProviderOptions
): SupabaseAuthProvider => ({
    async login({ email, password }: { email: string; password: string }) {
        const { error } = await client.auth.signIn({ email, password });

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
        const { error } = await client.auth.api.updateUser(access_token, {
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
    checkError() {
        return Promise.resolve();
    },
    checkAuth() {
        // Users are on the set-password page, nothing to do
        if (window.location.pathname === '/set-password') {
            return Promise.resolve();
        }

        const urlSearchParams = new URLSearchParams(
            window.location.hash.substr(1)
        );

        const access_token = urlSearchParams.get('access_token');
        const type = urlSearchParams.get('type');

        // Users have reset their password and must set a new one
        if (access_token && type === 'recovery') {
            return Promise.reject({
                redirectTo: `set-password?access_token=${access_token}`,
            });
        }

        // Users have have been invited and must set their password
        if (access_token && type === 'invite') {
            return Promise.reject({
                redirectTo: `set-password?access_token=${access_token}`,
            });
        }

        if (client.auth.session() == null) {
            return Promise.reject();
        }

        return Promise.resolve();
    },
    getPermissions() {
        return Promise.reject('Unknown method');
    },
    async getIdentity() {
        const user = client.auth.user();

        if (!user) {
            throw new Error();
        }

        if (typeof getIdentity === 'function') {
            const identity = await getIdentity(user);
            return identity;
        }

        return undefined;
    },
});

export type GetIdentity = (user: User) => Promise<UserIdentity>;
export type SupabaseAuthProviderOptions = {
    getIdentity?: GetIdentity;
};

export interface SupabaseAuthProvider extends AuthProvider {
    setPassword: (params: SetPasswordParams) => Promise<void>;
}

export type SetPasswordParams = { access_token: string; password: string };
