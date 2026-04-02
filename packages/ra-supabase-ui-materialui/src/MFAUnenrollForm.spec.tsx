import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFAUnenrollForm } from './MFAUnenrollForm';

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
        all: [
            {
                id: 'factor-789',
                factor_type: 'totp',
                friendly_name: 'Test App',
                status: 'verified',
            },
        ],
        totp: [],
        phone: [],
    }),
};

const renderForm = (authProvider = defaultAuthProvider) =>
    render(
        <TestMemoryRouter>
            <CoreAdminContext authProvider={authProvider}>
                <MFAUnenrollForm />
            </CoreAdminContext>
        </TestMemoryRouter>
    );

describe('MFAUnenrollForm', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the unenroll header and instructions', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.unenroll-header');
        expect(
            screen.getByText(
                'ra-supabase.mfa.totp.unenroll-instructions'
            )
        ).toBeDefined();
    });

    it('should render Unenroll and Cancel buttons', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.unenroll-header');
        expect(
            screen.getByText('ra-supabase.action.unenroll')
        ).toBeDefined();
        expect(screen.getByText('ra.action.cancel')).toBeDefined();
    });

    it('should call mfaUnenroll when Unenroll is clicked', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.unenroll-header');

        await userEvent.click(
            screen.getByText('ra-supabase.action.unenroll')
        );

        await waitFor(() => {
            expect(authProvider.mfaUnenroll).toHaveBeenCalledWith({
                factorId: 'factor-789',
            });
        });
    });

    it('should not call mfaUnenroll when no TOTP factors exist', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaListFactors: jest.fn().mockResolvedValue({
                all: [],
                totp: [],
                phone: [],
            }),
        };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.unenroll-header');

        await userEvent.click(
            screen.getByText('ra-supabase.action.unenroll')
        );

        await waitFor(() => {
            expect(authProvider.mfaUnenroll).not.toHaveBeenCalled();
        });
    });
});
