import path from 'path';
import { defineConfig } from 'cypress';
import { generateSync } from 'otplib';
import { createClient } from '@supabase/supabase-js';

// Created from .env.local-example by `make install` and in CI
const ENV_FILE = path.join(__dirname, 'packages/demo/.env');
// ponytail: @types/node 18 lacks loadEnvFile (Node >= 20.12), drop the cast once @types/node is upgraded
(process as unknown as { loadEnvFile(path: string): void }).loadEnvFile(
    ENV_FILE
);

const getEnv = (name: string) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is missing from ${ENV_FILE}`);
    }
    return value;
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_KEY = getEnv('SUPABASE_SERVICE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8000',
        setupNodeEvents(on) {
            on('task', {
                generateTOTP(secret: string) {
                    return generateSync({
                        secret,
                        strategy: 'totp',
                    });
                },
                async createTestUser({
                    email,
                    password,
                }: {
                    email: string;
                    password: string;
                }) {
                    const { data, error } =
                        await supabase.auth.admin.createUser({
                            email,
                            password,
                            email_confirm: true,
                        });
                    if (error) throw error;
                    return data.user.id;
                },
                async deleteTestUser(userId: string) {
                    const { error } = await supabase.auth.admin.deleteUser(
                        userId
                    );
                    if (error) throw error;
                    return null;
                },
                async deleteTestUserByEmail(email: string) {
                    const { data } = await supabase.auth.admin.listUsers();
                    const user = data?.users?.find(u => u.email === email);
                    if (user) {
                        await supabase.auth.admin.deleteUser(user.id);
                    }
                    return null;
                },
                async enrollUserInMFA({
                    email,
                    password,
                }: {
                    email: string;
                    password: string;
                }) {
                    // Use anon key so MFA enrollment works as a real user session
                    const userClient = createClient(
                        SUPABASE_URL,
                        SUPABASE_ANON_KEY
                    );
                    const { error: signInErr } =
                        await userClient.auth.signInWithPassword({
                            email,
                            password,
                        });
                    if (signInErr) throw signInErr;

                    // Enroll a TOTP factor
                    const { data: factor, error: enrollErr } =
                        await userClient.auth.mfa.enroll({
                            factorType: 'totp',
                            friendlyName: 'CRM Demo',
                        });
                    if (enrollErr) throw enrollErr;

                    // Verify it immediately to complete enrollment
                    const code = generateSync({
                        secret: factor.totp.secret,
                        strategy: 'totp',
                    });
                    const { error: verifyErr } =
                        await userClient.auth.mfa.challengeAndVerify({
                            factorId: factor.id,
                            code,
                        });
                    if (verifyErr) throw verifyErr;

                    await userClient.auth.signOut();
                    return factor.totp.secret;
                },
            });
        },
    },
});
