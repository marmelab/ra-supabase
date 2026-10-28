import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
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
            <CoreAdminContext authProvider={authProvider}>
                <MFAChallengeForm />
            </CoreAdminContext>
        </TestMemoryRouter>
    );

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
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        const input = screen.getByRole('textbox');
        await userEvent.type(input, '123456');
        await userEvent.click(screen.getByText('ra-supabase.action.verify'));

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
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        await userEvent.type(screen.getByRole('textbox'), '123456');
        await userEvent.click(screen.getByText('ra-supabase.action.verify'));

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).toHaveBeenCalledWith({
                factorId: 'factor-123',
                code: '123456',
            });
        });
    });

    it('should verify the factor passed by the enroll form', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider, [
            { pathname: '/mfa-challenge', state: { factorId: 'new-factor' } },
        ]);
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        await userEvent.type(screen.getByRole('textbox'), '123456');
        await userEvent.click(screen.getByText('ra-supabase.action.verify'));

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).toHaveBeenCalledWith({
                factorId: 'new-factor',
                code: '123456',
            });
        });
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

    it('should not call mfaChallengeAndVerify when no TOTP factors exist', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest.fn().mockResolvedValue({
                all: [],
                totp: [],
                phone: [],
            }),
        };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.challenge-header');

        const input = screen.getByRole('textbox');
        await userEvent.type(input, '123456');
        await userEvent.click(screen.getByText('ra-supabase.action.verify'));

        await waitFor(() => {
            expect(authProvider.mfaChallengeAndVerify).not.toHaveBeenCalled();
        });
    });
});
