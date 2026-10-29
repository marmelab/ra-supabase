import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
import { Notification } from 'ra-ui-materialui';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFAUnenrollForm } from './MFAUnenrollForm';

const verifiedFactor = {
    id: 'factor-789',
    factor_type: 'totp',
    friendly_name: 'Test App',
    status: 'verified',
};

const defaultAuthProvider = {
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    checkAuth: jest.fn().mockResolvedValue(undefined),
    checkError: jest.fn(),
    getPermissions: jest.fn(),
    mfaEnroll: jest.fn(),
    mfaUnenroll: jest.fn().mockResolvedValue({ id: 'factor-789' }),
    mfaChallengeAndVerify: jest.fn(),
    mfaListFactors: jest.fn().mockResolvedValue({
        all: [verifiedFactor],
        totp: [verifiedFactor],
        phone: [],
    }),
};

const renderForm = (authProvider = defaultAuthProvider) =>
    render(
        <TestMemoryRouter>
            <CoreAdminContext
                authProvider={authProvider}
                queryClient={
                    new QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    })
                }
            >
                <MFAUnenrollForm />
                <Notification />
            </CoreAdminContext>
        </TestMemoryRouter>
    );

const getUnenrollButton = () =>
    screen.getByRole('button', { name: 'ra-supabase.action.unenroll' });

const clickUnenrollWhenEnabled = async () => {
    await waitFor(() => {
        expect(getUnenrollButton().hasAttribute('disabled')).toBe(false);
    });
    await userEvent.click(getUnenrollButton());
};

describe('MFAUnenrollForm', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the unenroll header and instructions', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.unenroll_header');
        expect(
            screen.getByText('ra-supabase.mfa.totp.unenroll_instructions')
        ).toBeDefined();
    });

    it('should render Unenroll and Cancel buttons', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.unenroll_header');
        expect(screen.getByText('ra-supabase.action.unenroll')).toBeDefined();
        expect(screen.getByText('ra.action.cancel')).toBeDefined();
    });

    it('should call mfaUnenroll when Unenroll is clicked', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);

        await clickUnenrollWhenEnabled();

        await waitFor(() => {
            expect(authProvider.mfaUnenroll).toHaveBeenCalledWith({
                factorId: 'factor-789',
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

        await clickUnenrollWhenEnabled();

        await waitFor(() => {
            expect(authProvider.mfaUnenroll).toHaveBeenCalledWith({
                factorId: 'factor-789',
            });
        });
    });

    it('should disable Unenroll while factors are loading', async () => {
        renderForm({
            ...defaultAuthProvider,
            mfaListFactors: jest.fn(() => new Promise(() => {})),
        });
        await screen.findByText('ra-supabase.mfa.totp.unenroll_header');

        expect(getUnenrollButton().hasAttribute('disabled')).toBe(true);
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

        await clickUnenrollWhenEnabled();

        await screen.findByText('ra-supabase.mfa.totp.no_factor_error');
        expect(authProvider.mfaUnenroll).not.toHaveBeenCalled();
    });

    it('should notify the error when factors fail to load', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest
                .fn()
                .mockRejectedValue(new Error('Auth session missing!')),
        };
        renderForm(authProvider);

        await clickUnenrollWhenEnabled();

        await screen.findByText('Auth session missing!');
        expect(
            screen.queryByText('ra-supabase.mfa.totp.no_factor_error')
        ).toBeNull();
        expect(authProvider.mfaUnenroll).not.toHaveBeenCalled();
    });
});
