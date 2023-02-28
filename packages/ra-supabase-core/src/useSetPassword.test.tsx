import * as React from 'react';
import { useEffect } from 'react';
import { CoreAdminContext } from 'ra-core';
import { render, waitFor } from '@testing-library/react';
import { useSetPassword, UseSetPasswordOptions } from './useSetPassword';

describe('useSetPassword', () => {
    const UseSetPassword = ({
        onSuccess,
        onFailure,
    }: UseSetPasswordOptions) => {
        const setPassword = useSetPassword({
            onSuccess,
            onFailure,
        });

        useEffect(() => {
            setPassword({ access_token: 'token', password: 'bazinga' });
        }, [setPassword]);

        return null;
    };

    test('should accept a custom onSuccess function', async () => {
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest.fn(),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn().mockResolvedValue(undefined),
        };
        const myOnSuccess = jest.fn();

        render(
            <CoreAdminContext authProvider={authProvider}>
                <UseSetPassword onSuccess={myOnSuccess} />
            </CoreAdminContext>
        );

        expect(authProvider.setPassword).toHaveBeenCalledWith({
            access_token: 'token',
            password: 'bazinga',
        });
        await waitFor(() => {
            expect(myOnSuccess).toHaveBeenCalledTimes(1);
        });
    });

    test('should accept a custom onFailure function', async () => {
        const error = new Error('boo');
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest.fn(),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn().mockRejectedValue(error),
        };
        const myOnFailure = jest.fn();

        render(
            <CoreAdminContext authProvider={authProvider}>
                <UseSetPassword onFailure={myOnFailure} />
            </CoreAdminContext>
        );

        expect(authProvider.setPassword).toHaveBeenCalledWith({
            access_token: 'token',
            password: 'bazinga',
        });
        await waitFor(() => {
            expect(myOnFailure).toHaveBeenCalledWith(error);
        });
    });
});
