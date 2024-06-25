import * as React from 'react';
import { useEffect } from 'react';
import { CoreAdminContext } from 'ra-core';
import { render, waitFor } from '@testing-library/react';
import { useSetPassword, UseSetPasswordOptions } from './useSetPassword';

describe('useSetPassword', () => {
    const UseSetPassword = ({ onSuccess, onError }: UseSetPasswordOptions) => {
        const [setPassword] = useSetPassword({
            onSuccess,
            onError,
        });

        useEffect(() => {
            setPassword({
                access_token: 'token',
                refresh_token: 'refresh',
                password: 'bazinga',
            });
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

        await waitFor(() => {
            expect(authProvider.setPassword).toHaveBeenCalledWith({
                access_token: 'token',
                refresh_token: 'refresh',
                password: 'bazinga',
            });
        });

        await waitFor(() => {
            expect(myOnSuccess).toHaveBeenCalledTimes(1);
        });
    });

    test('should accept a custom onError function', async () => {
        const error = new Error('boo');
        const authProvider = {
            login: jest.fn(),
            logout: jest.fn(),
            checkAuth: jest.fn(),
            checkError: jest.fn(),
            getPermissions: jest.fn(),
            setPassword: jest.fn().mockRejectedValue(error),
        };
        const myOnError = jest.fn();

        render(
            <CoreAdminContext authProvider={authProvider}>
                <UseSetPassword onError={myOnError} />
            </CoreAdminContext>
        );

        await waitFor(() => {
            expect(authProvider.setPassword).toHaveBeenCalledWith({
                access_token: 'token',
                refresh_token: 'refresh',
                password: 'bazinga',
            });
        });
        await waitFor(() => {
            expect(myOnError).toHaveBeenCalledWith(
                error,
                {
                    access_token: 'token',
                    refresh_token: 'refresh',
                    password: 'bazinga',
                },
                undefined
            );
        });
    });
});
