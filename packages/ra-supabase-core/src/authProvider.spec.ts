import { supabaseAuthProvider } from './authProvider';

const mockEnrollResult = {
    id: 'factor-123',
    type: 'totp' as const,
    totp: {
        qr_code: 'data:image/svg+xml;...',
        secret: 'JBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/test?secret=JBSWY3DPEHPK3PXP',
    },
    friendly_name: 'CRM Demo',
};

const createMockSupabaseClient = (overrides: Record<string, any> = {}) => {
    return {
        auth: {
            signInWithPassword: jest
                .fn()
                .mockResolvedValue({ data: {}, error: null }),
            signOut: jest.fn().mockResolvedValue({ error: null }),
            getSession: jest
                .fn()
                .mockResolvedValue({ data: { session: {} }, error: null }),
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'user-1' } },
                error: null,
            }),
            mfa: {
                getAuthenticatorAssuranceLevel: jest.fn().mockResolvedValue({
                    data: { currentLevel: 'aal1', nextLevel: 'aal1' },
                    error: null,
                }),
                enroll: jest.fn().mockResolvedValue({
                    data: mockEnrollResult,
                    error: null,
                }),
                unenroll: jest.fn().mockResolvedValue({
                    data: { id: 'factor-123' },
                    error: null,
                }),
                challengeAndVerify: jest.fn().mockResolvedValue({
                    data: {
                        access_token: 'new-token',
                        token_type: 'bearer',
                        expires_in: 3600,
                        refresh_token: 'new-refresh',
                        user: { id: 'user-1' },
                    },
                    error: null,
                }),
                listFactors: jest.fn().mockResolvedValue({
                    data: { all: [], totp: [], phone: [] },
                    error: null,
                }),
            },
            ...overrides,
        },
    } as any;
};

describe('authProvider MFA', () => {
    const originalLocation = window.location;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { pathname: '/', hash: '', search: '' },
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: originalLocation,
        });
    });

    describe('login with enforceMFA', () => {
        it('should redirect to /mfa-enroll when user has no factors (aal1 -> aal1)', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal1', nextLevel: 'aal1' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            const result = await authProvider.login({
                email: 'test@test.com',
                password: 'password',
            });

            expect(result).toEqual({ redirectTo: '/mfa-enroll' });
        });

        it('should redirect to /mfa-challenge when user has enrolled factor (aal1 -> aal2)', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal1', nextLevel: 'aal2' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            const result = await authProvider.login({
                email: 'test@test.com',
                password: 'password',
            });

            expect(result).toEqual({ redirectTo: '/mfa-challenge' });
        });

        it('should not redirect to MFA when enforceMFA is not set', async () => {
            const client = createMockSupabaseClient();

            const authProvider = supabaseAuthProvider(client, {});

            const result = await authProvider.login({
                email: 'test@test.com',
                password: 'password',
            });

            expect(result).toBeUndefined();
            expect(
                client.auth.mfa.getAuthenticatorAssuranceLevel
            ).not.toHaveBeenCalled();
        });

        it('should respect redirectTo prefix for MFA routes', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal1', nextLevel: 'aal1' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
                redirectTo: '/admin',
            });

            const result = await authProvider.login({
                email: 'test@test.com',
                password: 'password',
            });

            expect(result).toEqual({ redirectTo: '/admin/mfa-enroll' });
        });

        it('should not redirect when user is already at aal2', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal2', nextLevel: 'aal2' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            const result = await authProvider.login({
                email: 'test@test.com',
                password: 'password',
            });

            expect(result).toBeUndefined();
        });
    });

    describe('checkAuth with enforceMFA', () => {
        it('should redirect to /mfa-enroll when session exists but aal1 -> aal1', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal1', nextLevel: 'aal1' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).rejects.toEqual({
                redirectTo: '/mfa-enroll',
                message: false,
            });
        });

        it('should redirect to /mfa-challenge when session exists but aal1 -> aal2', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal1', nextLevel: 'aal2' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).rejects.toEqual({
                redirectTo: '/mfa-challenge',
                message: false,
            });
        });

        it('should allow access when user is at aal2', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValue({
                data: { currentLevel: 'aal2', nextLevel: 'aal2' },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
        });

        it('should skip MFA check on /mfa-enroll route', async () => {
            const client = createMockSupabaseClient();
            window.location.pathname = '/mfa-enroll';

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
            expect(client.auth.getSession).not.toHaveBeenCalled();
        });

        it('should skip MFA check on /mfa-challenge route', async () => {
            const client = createMockSupabaseClient();
            window.location.pathname = '/mfa-challenge';

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
            expect(client.auth.getSession).not.toHaveBeenCalled();
        });

        it('should skip MFA check on hash-based /mfa-enroll route', async () => {
            const client = createMockSupabaseClient();
            window.location.pathname = '/';
            window.location.hash = '#/mfa-enroll';

            const authProvider = supabaseAuthProvider(client, {
                enforceMFA: true,
            });

            await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
            expect(client.auth.getSession).not.toHaveBeenCalled();
        });
    });

    describe('mfaEnroll', () => {
        it('should call supabase enroll with friendlyName', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {
                mfaAppFriendlyName: 'My App',
            });

            const result = await authProvider.mfaEnroll({
                factorType: 'totp',
            });

            expect(client.auth.mfa.enroll).toHaveBeenCalledWith({
                factorType: 'totp',
                friendlyName: 'My App',
            });
            expect(result).toEqual(mockEnrollResult);
        });

        it('should unenroll existing factor with same friendlyName before enrolling', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.listFactors.mockResolvedValue({
                data: {
                    all: [
                        {
                            id: 'old-factor',
                            friendly_name: 'My App',
                            factor_type: 'totp',
                            status: 'unverified',
                        },
                    ],
                    totp: [],
                    phone: [],
                },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                mfaAppFriendlyName: 'My App',
            });

            await authProvider.mfaEnroll({ factorType: 'totp' });

            expect(client.auth.mfa.unenroll).toHaveBeenCalledWith({
                factorId: 'old-factor',
            });
            expect(client.auth.mfa.enroll).toHaveBeenCalledWith({
                factorType: 'totp',
                friendlyName: 'My App',
            });
        });

        it('should not unenroll when no conflicting factor exists', async () => {
            const client = createMockSupabaseClient();
            client.auth.mfa.listFactors.mockResolvedValue({
                data: {
                    all: [
                        {
                            id: 'other-factor',
                            friendly_name: 'Other App',
                            factor_type: 'totp',
                            status: 'verified',
                        },
                    ],
                    totp: [],
                    phone: [],
                },
                error: null,
            });

            const authProvider = supabaseAuthProvider(client, {
                mfaAppFriendlyName: 'My App',
            });

            await authProvider.mfaEnroll({ factorType: 'totp' });

            expect(client.auth.mfa.unenroll).not.toHaveBeenCalled();
        });

        it('should skip listFactors check when no friendlyName configured', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {});

            await authProvider.mfaEnroll({ factorType: 'totp' });

            expect(client.auth.mfa.listFactors).not.toHaveBeenCalled();
            expect(client.auth.mfa.enroll).toHaveBeenCalledWith({
                factorType: 'totp',
                friendlyName: undefined,
            });
        });

        it('should throw for phone factor type', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {});

            await expect(
                authProvider.mfaEnroll({ factorType: 'phone' })
            ).rejects.toThrow('Phone MFA is not supported yet');
        });
    });

    describe('mfaUnenroll', () => {
        it('should call supabase unenroll with factorId', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {});

            const result = await authProvider.mfaUnenroll({
                factorId: 'factor-123',
            });

            expect(client.auth.mfa.unenroll).toHaveBeenCalledWith({
                factorId: 'factor-123',
            });
            expect(result).toEqual({ id: 'factor-123' });
        });
    });

    describe('mfaChallengeAndVerify', () => {
        it('should call supabase challengeAndVerify with factorId and code', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {});

            const result = await authProvider.mfaChallengeAndVerify({
                factorId: 'factor-123',
                code: '123456',
            });

            expect(client.auth.mfa.challengeAndVerify).toHaveBeenCalledWith({
                factorId: 'factor-123',
                code: '123456',
            });
            expect(result).toEqual(
                expect.objectContaining({ access_token: 'new-token' })
            );
        });
    });

    describe('mfaListFactors', () => {
        it('should call supabase listFactors', async () => {
            const client = createMockSupabaseClient();
            const authProvider = supabaseAuthProvider(client, {});

            const result = await authProvider.mfaListFactors();

            expect(client.auth.mfa.listFactors).toHaveBeenCalled();
            expect(result).toEqual({ all: [], totp: [], phone: [] });
        });
    });

    describe('getPermissions with MFA routes', () => {
        it('should return undefined on /mfa-enroll route', async () => {
            const client = createMockSupabaseClient();
            window.location.pathname = '/mfa-enroll';

            const getPermissions = jest.fn();
            const authProvider = supabaseAuthProvider(client, {
                getPermissions,
            });

            const result = await authProvider.getPermissions({});

            expect(result).toBeUndefined();
            expect(getPermissions).not.toHaveBeenCalled();
        });

        it('should return undefined on /mfa-challenge route', async () => {
            const client = createMockSupabaseClient();
            window.location.pathname = '/mfa-challenge';

            const getPermissions = jest.fn();
            const authProvider = supabaseAuthProvider(client, {
                getPermissions,
            });

            const result = await authProvider.getPermissions({});

            expect(result).toBeUndefined();
            expect(getPermissions).not.toHaveBeenCalled();
        });
    });
});
