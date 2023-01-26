import * as React from 'react';
import { CoreAdminContext } from 'ra-core';
import { render, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
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
        const history = createMemoryHistory({ initialEntries: ['/login'] });
        const push = jest.spyOn(history, 'push');

        render(
            <CoreAdminContext authProvider={authProvider} history={history}>
                <UseRedirectIfAuthenticated />
            </CoreAdminContext>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(push).toHaveBeenCalledTimes(0);
        });
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
        const history = createMemoryHistory({ initialEntries: ['/login'] });
        const push = jest.spyOn(history, 'push');

        render(
            <CoreAdminContext authProvider={authProvider} history={history}>
                <UseRedirectIfAuthenticated />
            </CoreAdminContext>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/');
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
        const history = createMemoryHistory({ initialEntries: ['/login'] });
        const push = jest.spyOn(history, 'push');

        render(
            <CoreAdminContext authProvider={authProvider} history={history}>
                <UseRedirectIfAuthenticated redirectTo="/dashboard" />
            </CoreAdminContext>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/dashboard');
        });
    });
});
