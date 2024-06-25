import * as React from 'react';
import { CoreAdminContext, TestMemoryRouter } from 'react-admin';
import { render, waitFor } from '@testing-library/react';
import {
    useRedirectIfAuthenticated,
    UseRedirectIfAuthenticatedOptions,
} from './useRedirectIfAuthenticated';

describe('useRedirectIfAuthenticated', () => {
    const UseRedirectIfAuthenticated = ({
        redirectTo,
    }: {
        redirectTo?: UseRedirectIfAuthenticatedOptions;
    }) => {
        useRedirectIfAuthenticated(redirectTo);

        return null;
    };

    test('should not redirect users if they are not authenticated', async () => {
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest
                .fn()
                .mockRejectedValue(new Error('Not authenticated')),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn(),
        };

        let location;
        render(
            <TestMemoryRouter
                initialEntries={['/login']}
                locationCallback={l => {
                    location = l;
                }}
            >
                <CoreAdminContext authProvider={authProvider}>
                    <UseRedirectIfAuthenticated />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        expect(location).toEqual(
            expect.objectContaining({
                hash: '',
                pathname: '/login',
                search: '',
            })
        );
    });

    test('should redirect users if they are authenticated', async () => {
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest.fn().mockResolvedValue(undefined),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn(),
        };

        let location;
        render(
            <TestMemoryRouter
                initialEntries={['/login']}
                locationCallback={l => {
                    location = l;
                }}
            >
                <CoreAdminContext authProvider={authProvider}>
                    <UseRedirectIfAuthenticated />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(location).toEqual(
                expect.objectContaining({
                    hash: '',
                    pathname: '/',
                    search: '',
                })
            );
        });
    });

    test('should redirect users to the provided path if they are authenticated', async () => {
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest.fn().mockResolvedValue(undefined),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn(),
        };

        let location;
        render(
            <TestMemoryRouter
                initialEntries={['/login']}
                locationCallback={l => {
                    location = l;
                }}
            >
                <CoreAdminContext authProvider={authProvider}>
                    <UseRedirectIfAuthenticated redirectTo="/dashboard" />
                </CoreAdminContext>
            </TestMemoryRouter>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(location).toEqual(
                expect.objectContaining({
                    hash: '',
                    pathname: '/dashboard',
                    search: '',
                })
            );
        });
    });
});
