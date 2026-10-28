import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
import { Notification } from 'ra-ui-materialui';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InitialEntry } from 'react-router';
import { MFAChallengeForm } from './MFAChallengeForm';

const verifiedFactor = {
    id: 'factor-123',
    factor_type: 'totp',
    friendly_name: 'Test App',
    status: 'verified',
};

const mockEnrollResult = {
    id: 'factor-123',
    type: 'totp' as const,
    totp: {
        qr_code: 'data:image/svg+xml;...',
        secret: 'JBSWY3DPEHPK3PXP',
        uri: 'otpauth://totp/test?secret=JBSWY3DPEHPK3PXP',
    },
    friendly_name: 'Test App',
};

const defaultAuthProvider = {
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    checkAuth: jest.fn().mockResolvedValue(undefined),
    checkError: jest.fn(),
    getPermissions: jest.fn(),
    mfaEnroll: jest.fn().mockResolvedValue(mockEnrollResult),
    mfaUnenroll: jest.fn().mockResolvedValue({ id: 'factor-123' }),
    mfaChallengeAndVerify: jest.fn().mockResolvedValue({
        access_token: 'new-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'new-refresh',
        user: { id: 'user-1' },
    }),
    mfaListFactors: jest.fn().mockResolvedValue({
        all: [verifiedFactor],
        totp: [verifiedFactor],
        phone: [],
    }),
};

const renderForm = (
    authProvider = defaultAuthProvider,
    initialEntries?: InitialEntry[]
) =>
    render(
        <TestMemoryRouter initialEntries={initialEntries}>
            <CoreAdminContext
                authProvider={authProvider}
                queryClient={
                    new QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    })
                }
            >
                <MFAChallengeForm />
                <Notification />
            </CoreAdminContext>
        </TestMemoryRouter>
    );

const getVerifyButton = () =>
    screen.getByRole('button', { name: 'ra-supabase.action.verify' });

const submitCodeWhenEnabled = async (code: string) => {
    await userEvent.type(await screen.findByRole('textbox'), code);
    await waitFor(() => {
        expect(getVerifyButton().hasAttribute('disabled')).toBe(false);
    });
    await userEvent.click(getVerifyButton());
};

describe('MFAChallengeForm', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the challenge header and instructions', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');
        expect(
            screen.getByText('ra-supabase.mfa.totp.challenge-instructions')
        ).toBeDefined();
    });

    it('should render the code input', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');
        expect(screen.getByRole('textbox')).toBeDefined();
    });

    it('should render Verify and Cancel buttons', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');
        expect(screen.getByText('ra-supabase.action.verify')).toBeDefined();
        expect(screen.getByText('ra.action.cancel')).toBeDefined();
    });

    it('should call mfaChallengeAndVerify on submit with correct params', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);

        await submitCodeWhenEnabled('123456');

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).toHaveBeenCalledWith({
                factorId: 'factor-123',
                code: '123456',
            });
        });
    });

    it('should ignore unverified factors', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest.fn().mockResolvedValue({
                all: [
                    {
                        id: 'stale-factor',
                        factor_type: 'totp',
                        friendly_name: 'Test App',
                        status: 'unverified',
                    },
                    verifiedFactor,
                ],
                totp: [verifiedFactor],
                phone: [],
            }),
        };
        renderForm(authProvider);

        await submitCodeWhenEnabled('123456');

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).toHaveBeenCalledWith({
                factorId: 'factor-123',
                code: '123456',
            });
        });
    });

    it('should verify the factor passed by the enroll form without waiting for factors', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest.fn(() => new Promise(() => {})),
        };
        renderForm(authProvider, [
            { pathname: '/mfa-challenge', state: { factorId: 'new-factor' } },
        ]);

        await submitCodeWhenEnabled('123456');

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).toHaveBeenCalledWith({
                factorId: 'new-factor',
                code: '123456',
            });
        });
    });

    it('should disable Verify while factors are loading', async () => {
        renderForm({
            ...defaultAuthProvider,
            mfaListFactors: jest.fn(() => new Promise(() => {})),
        });
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        expect(getVerifyButton().hasAttribute('disabled')).toBe(true);
    });

    it('should call logout when Cancel is clicked', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        await userEvent.click(screen.getByText('ra.action.cancel'));

        await waitFor(() => {
            expect(authProvider.logout).toHaveBeenCalled();
        });
    });

    it('should notify that no TOTP factor exists', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest.fn().mockResolvedValue({
                all: [],
                totp: [],
                phone: [],
            }),
        };
        renderForm(authProvider);

        await submitCodeWhenEnabled('123456');

        await screen.findByText('ra-supabase.mfa.totp.no-factor-error');
        expect(authProvider.mfaChallengeAndVerify).not.toHaveBeenCalled();
    });

    it('should notify the error when factors fail to load', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest
                .fn()
                .mockRejectedValue(new Error('Auth session missing!')),
        };
        renderForm(authProvider);

        await submitCodeWhenEnabled('123456');

        await screen.findByText('Auth session missing!');
        expect(
            screen.queryByText('ra-supabase.mfa.totp.no-factor-error')
        ).toBeNull();
        expect(authProvider.mfaChallengeAndVerify).not.toHaveBeenCalled();
    });
});
