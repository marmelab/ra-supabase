import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'ra-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Location } from 'react-router';
import { MFAEnrollForm } from './MFAEnrollForm';

const mockEnrollResult = {
    id: 'factor-456',
    type: 'totp' as const,
    totp: {
        qr_code: 'data:image/svg+xml;base64,PHN2Zz4=',
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
    mfaUnenroll: jest.fn().mockResolvedValue({ id: 'factor-456' }),
    mfaChallengeAndVerify: jest.fn(),
    mfaListFactors: jest.fn().mockResolvedValue({
        all: [],
        totp: [],
        phone: [],
    }),
};

const renderForm = (
    authProvider = defaultAuthProvider,
    locationCallback?: (location: Location) => void
) =>
    render(
        <TestMemoryRouter locationCallback={locationCallback}>
            <CoreAdminContext authProvider={authProvider}>
                <MFAEnrollForm />
            </CoreAdminContext>
        </TestMemoryRouter>
    );

describe('MFAEnrollForm', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the enroll header and instructions', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');
        expect(
            screen.getByText('ra-supabase.mfa.totp.enroll_instructions')
        ).toBeDefined();
    });

    it('should render "Set up" button initially', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');
        expect(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        ).toBeDefined();
    });

    it('should render Cancel button', async () => {
        renderForm();
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');
        expect(screen.getByText('ra.action.cancel')).toBeDefined();
    });

    it('should call mfaEnroll when "Set up" is clicked', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );

        await waitFor(() => {
            expect(authProvider.mfaEnroll).toHaveBeenCalledWith({
                factorType: 'totp',
            });
        });
    });

    it('should allow to retry "Set up" after an enroll error', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaEnroll: jest
                .fn()
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce(mockEnrollResult),
        };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );
        await userEvent.click(
            await screen.findByText('ra-supabase.mfa.totp.enroll_start')
        );

        await screen.findByAltText('ra-supabase.mfa.totp.qr_code_alt');
        expect(authProvider.mfaEnroll).toHaveBeenCalledTimes(2);
    });

    it('should show QR code and Next button after successful enroll', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );

        await waitFor(() => {
            expect(authProvider.mfaEnroll).toHaveBeenCalled();
        });

        const qrImage = await screen.findByAltText(
            'ra-supabase.mfa.totp.qr_code_alt'
        );
        expect(qrImage).toBeDefined();
        expect(qrImage.getAttribute('src')).toBe(
            'data:image/svg+xml;base64,PHN2Zz4='
        );

        expect(screen.getByText('ra-supabase.action.next')).toBeDefined();
        expect(
            screen.getByText(
                'ra-supabase.mfa.totp.copy_secret_key_to_clipboard'
            )
        ).toBeDefined();
    });

    it('should pass the enrolled factorId to the challenge page on Next', async () => {
        let location: Location | undefined;
        renderForm(defaultAuthProvider, l => {
            location = l;
        });
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );
        await screen.findByAltText('ra-supabase.mfa.totp.qr_code_alt');
        await userEvent.click(screen.getByText('ra-supabase.action.next'));

        await waitFor(() => {
            expect(location?.pathname).toBe('/mfa-challenge');
        });
        expect(location?.state).toMatchObject({ factorId: 'factor-456' });
    });

    it('should call logout when Cancel is clicked before enroll', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(screen.getByText('ra.action.cancel'));

        await waitFor(() => {
            expect(authProvider.logout).toHaveBeenCalled();
        });
        expect(authProvider.mfaUnenroll).not.toHaveBeenCalled();
    });

    it('should unenroll and logout when Cancel is clicked after enroll', async () => {
        const authProvider = { ...defaultAuthProvider };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );
        await screen.findByAltText('ra-supabase.mfa.totp.qr_code_alt');

        await userEvent.click(screen.getByText('ra.action.cancel'));

        await waitFor(() => {
            expect(authProvider.mfaUnenroll).toHaveBeenCalledWith({
                factorId: 'factor-456',
            });
        });
        await waitFor(() => {
            expect(authProvider.logout).toHaveBeenCalled();
        });
    });

    it('should still logout when unenroll fails on Cancel', async () => {
        const authProvider = {
            ...defaultAuthProvider,
            mfaUnenroll: jest
                .fn()
                .mockRejectedValue(new Error('Network error')),
        };
        renderForm(authProvider);
        await screen.findByText('ra-supabase.mfa.totp.enroll_header');

        await userEvent.click(
            screen.getByText('ra-supabase.mfa.totp.enroll_start')
        );
        await screen.findByAltText('ra-supabase.mfa.totp.qr_code_alt');

        await userEvent.click(screen.getByText('ra.action.cancel'));

        await waitFor(() => {
            expect(authProvider.logout).toHaveBeenCalled();
        });
    });
});
