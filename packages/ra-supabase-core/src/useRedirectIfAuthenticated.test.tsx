import * as React from 'react';
import { AuthContext } from 'ra-core';
import { renderWithRedux } from 'ra-test';
import { waitFor } from '@testing-library/react';
import { Router } from 'react-router';
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

        renderWithRedux(
            <Router history={history}>
                <AuthContext.Provider value={authProvider}>
                    <UseRedirectIfAuthenticated />
                </AuthContext.Provider>
            </Router>
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

        renderWithRedux(
            <Router history={history}>
                <AuthContext.Provider value={authProvider}>
                    <UseRedirectIfAuthenticated />
                </AuthContext.Provider>
            </Router>
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

        renderWithRedux(
            <Router history={history}>
                <AuthContext.Provider value={authProvider}>
                    <UseRedirectIfAuthenticated redirectTo="/dashboard" />
                </AuthContext.Provider>
            </Router>
        );

        expect(authProvider.checkAuth).toHaveBeenCalled();
        await waitFor(() => {
            expect(push).toHaveBeenCalledWith('/dashboard');
        });
    });
});
